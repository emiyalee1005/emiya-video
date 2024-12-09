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

export class OssHelper {
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
    } else {
      throw new Error(res.data?.code || res.status.toString());
    }
  }

  public async getUrl(options: { videoId: string }) {
    console.log(options);
    return 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
    // return (
    //   await this.request<{ url: string }>({
    //     url: '/player/get',
    //     method: 'get',
    //     params: options,
    //   })
    // ).url;
  }

  private async createTask(options: { file: File | Blob; filename?: string }) {
    return await this.request<{ videoId: string; uploadUrls: string[] }>(
      {
        url: '/admin/createUploadTask',
        method: 'post',
        data: { name: options.filename || (options.file as File).name, fileSize: options.file.size },
      },
      {
        mockEnabled: true,
        mockData: {
          videoId: '6cd380a444a74f3abe1b7873ac53d26d',
          uploadUrls: [
            'https://vod-origin-xkg8.shoss.xstore.ctyun.cn/6cd380a444a74f3abe1b7873ac53d26d.mp4?uploadId=2~vQW_JGGGx9nxlsELfu0suatHU1MDBza&partNumber=1&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241208T165833Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86400&X-Amz-Credential=OP2IZ4L763MYVB757HM8%2F20241208%2Fcn-north-1%2Fs3%2Faws4_request&X-Amz-Signature=093bb686538047288569e173731e40744f9a02d1ebb8aaa39d6e6f02d6d3ddc1',
            'https://vod-origin-xkg8.shoss.xstore.ctyun.cn/6cd380a444a74f3abe1b7873ac53d26d.mp4?uploadId=2~vQW_JGGGx9nxlsELfu0suatHU1MDBza&partNumber=2&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241208T165833Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86400&X-Amz-Credential=OP2IZ4L763MYVB757HM8%2F20241208%2Fcn-north-1%2Fs3%2Faws4_request&X-Amz-Signature=d4c13f9f9635046bfb56bfd5df1569889c5d8d8745cc71c565a3340cfc1c9b3b',
            'https://vod-origin-xkg8.shoss.xstore.ctyun.cn/6cd380a444a74f3abe1b7873ac53d26d.mp4?uploadId=2~vQW_JGGGx9nxlsELfu0suatHU1MDBza&partNumber=3&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241208T165833Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86399&X-Amz-Credential=OP2IZ4L763MYVB757HM8%2F20241208%2Fcn-north-1%2Fs3%2Faws4_request&X-Amz-Signature=d00c1ec26a84a2be6fa1c94f86e7bbd01ffb469ada57395f15e7c5db59010bdb',
            'https://vod-origin-xkg8.shoss.xstore.ctyun.cn/6cd380a444a74f3abe1b7873ac53d26d.mp4?uploadId=2~vQW_JGGGx9nxlsELfu0suatHU1MDBza&partNumber=4&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241208T165833Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86399&X-Amz-Credential=OP2IZ4L763MYVB757HM8%2F20241208%2Fcn-north-1%2Fs3%2Faws4_request&X-Amz-Signature=e0f01d73c01cde640e71f4c5c61e33ff51f208b6033b14a2f7ca748085858f66',
            'https://vod-origin-xkg8.shoss.xstore.ctyun.cn/6cd380a444a74f3abe1b7873ac53d26d.mp4?uploadId=2~vQW_JGGGx9nxlsELfu0suatHU1MDBza&partNumber=5&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241208T165833Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86399&X-Amz-Credential=OP2IZ4L763MYVB757HM8%2F20241208%2Fcn-north-1%2Fs3%2Faws4_request&X-Amz-Signature=bb5a9d89fd',
          ],
        },
      },
    );
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
            const res = await axios<{ eTag: string }>({ url: taskMeta.uploadUrls[chunk.partNum - 1], method: 'put', data: formData, params: { partNum: chunk.partNum } });
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

(window as any).OssHelper = OssHelper;
