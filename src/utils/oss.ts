import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import pLimit from 'p-limit';

export namespace OssUploader {
  export type ConstructionOptions = {
    apiBaseUrl?: string;
    chunkSize?: number;
    concurrency?: number;
    chunkFailureRetry?: number;
  };
  export type UploadOptions = {
    file: File | Blob;
    filename?: string;
    onProgress: (event: { totalSize: number; uploadedSize: number; totalChunkCount: number; uploadedChunkCount: number; uploadedChunks: number[] }) => any;
  };
}

type ApiResponseWrapper<T = any> = {
  success: boolean;
  data?: T;
  code: string;
  msg: string;
  requestId: string;
  timestamp: string;
};

export class OssUploader {
  private readonly chunkFailureRetry: number;
  private readonly chunkSize: number;
  private axios: AxiosInstance;
  public mockEnabled: boolean = false;
  private readonly apiBaseUrl: string;
  private readonly concurrency: number;
  constructor(options: OssUploader.ConstructionOptions) {
    this.apiBaseUrl = options.apiBaseUrl;
    this.axios = axios.create({ baseURL: this.apiBaseUrl });
    this.chunkSize = options.chunkSize || 5 * 1024 * 1024;
    this.concurrency = options.concurrency || 4;
    this.chunkFailureRetry = options.chunkFailureRetry || 3;
  }

  private async request<T = Exclude<any, Function>>(config: AxiosRequestConfig, extraOptions?: { mockEnabled?: boolean; mockData?: T | (() => T) }) {
    const mockEnabled = typeof extraOptions?.mockEnabled === 'boolean' ? extraOptions?.mockEnabled : this.mockEnabled;
    if (mockEnabled) {
      return (typeof extraOptions.mockData === 'function' ? (extraOptions.mockData as Function)() : extraOptions.mockData) as T;
    }
    const res = await this.axios<ApiResponseWrapper<T>>(config);

    if (
      res.status >= 200 &&
      res.status < 300 &&
      ((res.data instanceof Blob && res.headers['content-type'] !== 'application/json') || (!(res.data instanceof Blob) && res.data.code === 'OK' && res.data.success))
    ) {
      return res.data instanceof Blob ? (res.data as T) : res.data.data;
    }
  }

  private async createTask(options: { file: File | Blob; filename?: string }) {
    return await this.request<{ videoId: string; url: string }>({
      url: '/admin/createUploadTask',
      method: 'post',
      data: { name: options.filename || (options.file as File).name, fileSize: options.file.size },
    });
  }

  private async updateTask(options: { partNumber: number; eTag: string; videoId: string }) {
    return await this.request({
      url: '/admin/updateEtag',
      method: 'post',
      data: options,
    });
  }

  private async completeTask(options: { videoId: string }) {
    return await this.request({
      url: '/admin/completeUploadTask',
      method: 'post',
      data: options,
    });
  }

  public async getVideoDuration(options: { videoId: string }) {
    return await this.request<number>({
      url: '/admin/getDuration',
      method: 'get',
      params: options,
    });
  }

  public async upload(options: OssUploader.UploadOptions) {
    const chunkCount = Math.ceil(options.file.size / this.chunkSize);
    const chunks: { start: number; end: number; size: number; partNum: number }[] = [];
    for (let i = 0; i < chunkCount; i++) {
      const start = i * this.chunkSize;
      const end = Math.min(options.file.size, start + this.chunkSize);
      chunks.push({
        partNum: i + 1,
        start,
        end,
        size: end - start,
      });
    }
    const taskMeta = await this.createTask({ file: options.file, filename: options.filename });
    const limit = pLimit(this.concurrency);

    let uploadedChunkCount = 0,
      uploadedSize = 0,
      uploadedChunks: number[] = [];

    const controller = new AbortController();

    const chunkUploaders = chunks.map(chunk => {
      return limit(async () => {
        let retryLeft = this.chunkFailureRetry;
        while (retryLeft) {
          try {
            if (controller.signal.aborted) throw new Error(`Aborted`);
            const formData = new FormData();
            const chunkFile = options.file.slice(chunk.start, chunk.end);
            formData.append('file', chunkFile);
            const res = await axios<{ eTag: string }>({ url: taskMeta.url, method: 'post', data: formData, params: { partNum: chunk.partNum } });
            if (controller.signal.aborted) throw new Error(`Aborted`);
            await this.updateTask({ videoId: taskMeta.videoId, partNumber: chunk.partNum, eTag: res.data.eTag });
            if (controller.signal.aborted) throw new Error(`Aborted`);
            ++uploadedChunkCount;
            uploadedSize += chunkFile.size;
            uploadedChunks.push(chunk.partNum);
            try {
              options.onProgress &&
                options.onProgress({
                  uploadedSize,
                  uploadedChunkCount,
                  uploadedChunks,
                  totalChunkCount: chunks.length,
                  totalSize: options.file.size,
                });
            } catch (e) {
              console.error(e);
            }
            return res.data.eTag;
          } catch (e) {
            --retryLeft;
            if (!retryLeft || controller.signal.aborted) {
              controller.abort(`Chunk ${chunk.partNum} upload failed after ${this.chunkFailureRetry} attempts with error : ${e.message}`);
              throw e;
            }
          }
        }
      });
    });

    await Promise.all(chunkUploaders);
    await this.completeTask({ videoId: taskMeta.videoId });
    return taskMeta.videoId;
  }
}
