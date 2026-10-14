import { SetMetadata } from "@nestjs/common";

export const SKIP_TRANSFORM_KEY = "skip_transform";

/**
 * 标记某个路由跳过全局的响应包装拦截器。
 * 用于 RSS 等需要返回原始文本（非 JSON）的接口。
 */
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
