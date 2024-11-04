import axios, { AxiosInstance } from 'axios';
import { AxiosRequestConfig } from 'axios/index';

export namespace OssUploader {
  export type ConstructionOptions = {
    apiBaseUrl: string;
  };
  export type UploadOptions = {
    apiBaseUrl: string;
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
  private axios: AxiosInstance;
  public mockEnabled: boolean = false;
  private readonly apiBaseUrl: string;
  constructor(options: OssUploader.ConstructionOptions) {
    this.apiBaseUrl = options.apiBaseUrl;
    this.axios = axios.create({ baseURL: this.apiBaseUrl });
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
    return (
      await this.request<{ videoId: string }>({
        url: '/admin/createUploadTask',
        method: 'post',
        data: { name: options.filename || (options.file as File).name, fileSize: options.file.size },
      })
    ).videoId;
  }

  public async upload(options: OssUploader.UploadOptions) {}
}
