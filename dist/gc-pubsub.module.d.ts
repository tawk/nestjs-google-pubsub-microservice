import { DynamicModule, ModuleMetadata, Provider } from '@nestjs/common';
import { GCPubSubOptions } from './gc-pubsub.interface';
export interface GCPubSubRegisterClientOptions {
  name: string;
  config: GCPubSubOptions;
}
export interface GCPubSubRegisterClientAsyncOption
  extends Pick<ModuleMetadata, 'imports'> {
  name: string;
  useFactory?: (...args: any[]) => Promise<GCPubSubOptions> | GCPubSubOptions;
  inject?: any[];
  extraProviders?: Provider[];
}
export declare class GCPubSubClientModule {
  static register(options: GCPubSubRegisterClientOptions[]): DynamicModule;
  static registerAsync(
    options: GCPubSubRegisterClientAsyncOption[],
  ): DynamicModule;
  private static createAsyncProviders;
  private static createFactoryWrapper;
  private static assignOnAppShutdownHook;
}
