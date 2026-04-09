import { renderApplication } from '@angular/platform-server';
import { bootstrapApplication } from '@angular/platform-browser';
import { config } from './app/app.config.server';
import { App } from './app/app';

export default async function (url: string, document: string): Promise<string> {
  return renderApplication(ctx => bootstrapApplication(App, config, ctx), { document, url });
}
