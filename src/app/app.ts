import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from './components/header';
import { Footer } from './components/footer';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
