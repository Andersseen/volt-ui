import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  VoltBreadcrumbs,
  VoltBreadcrumbItem,
  VoltBreadcrumbList,
  VoltNativeBreadcrumbLink,
  VoltBreadcrumbPage,
  VoltBreadcrumbSeparator,
  VoltCombobox,
  VoltDialog,
  VoltDialogContent,
  VoltDialogDescription,
  VoltDialogOverlay,
  VoltDialogTitle,
  VoltDrawer,
  VoltDrawerClose,
  VoltDrawerContent,
  VoltDrawerOverlay,
  VoltDrawerTitle,
  VoltError,
  VoltFormField,
  VoltHint,
  VoltInput,
  VoltLabel,
  VoltNativeButton,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltTable,
  VoltTableBody,
  VoltTableCell,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
  VoltTextarea,
} from '@voltui/components';

/**
 * A settings screen as an app in Spanish and Ukrainian would write it — long labels, hints and
 * actions — for the reflow, zoom, focus, motion and forced-colours contracts
 * (`e2e/contracts/adaptive.spec.ts`). The same form also lives in a dialog and a drawer.
 */
@Component({
  selector: 'app-adaptive',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    VoltBreadcrumbs,
    VoltBreadcrumbItem,
    VoltBreadcrumbList,
    VoltNativeBreadcrumbLink,
    VoltBreadcrumbPage,
    VoltBreadcrumbSeparator,
    VoltCombobox,
    VoltDialog,
    VoltDialogContent,
    VoltDialogDescription,
    VoltDialogOverlay,
    VoltDialogTitle,
    VoltDrawer,
    VoltDrawerClose,
    VoltDrawerContent,
    VoltDrawerOverlay,
    VoltDrawerTitle,
    VoltError,
    VoltFormField,
    VoltHint,
    VoltInput,
    VoltLabel,
    VoltNativeButton,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltTable,
    VoltTableBody,
    VoltTableCell,
    VoltTableHead,
    VoltTableHeader,
    VoltTableRow,
    VoltTabs,
    VoltTabsContent,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTextarea,
  ],
  template: `
    <div id="adaptive" class="grid gap-6">
      <nav aria-label="Ruta de navegación">
        <volt-breadcrumbs>
          <volt-breadcrumb-list>
            <volt-breadcrumb-item
              ><a voltBreadcrumbLink href="#adaptive"
                >Administración del espacio de trabajo</a
              ></volt-breadcrumb-item
            >
            <volt-breadcrumb-separator />
            <volt-breadcrumb-item
              ><volt-breadcrumb-page
                >Налаштування сповіщень і безпеки</volt-breadcrumb-page
              ></volt-breadcrumb-item
            >
          </volt-breadcrumb-list>
        </volt-breadcrumbs>
      </nav>

      <volt-tabs value="general">
        <volt-tabs-list aria-label="Secciones de configuración" class="flex-wrap">
          <volt-tabs-trigger value="general">Configuración general</volt-tabs-trigger>
          <volt-tabs-trigger value="billing">Facturación y suscripciones</volt-tabs-trigger>
          <volt-tabs-trigger value="security">Безпека облікового запису</volt-tabs-trigger>
        </volt-tabs-list>
        <volt-tabs-content value="general">
          <ng-container [ngTemplateOutlet]="form" />
        </volt-tabs-content>
        <volt-tabs-content value="billing"><p>—</p></volt-tabs-content>
        <volt-tabs-content value="security"><p>—</p></volt-tabs-content>
      </volt-tabs>

      <div class="overflow-x-auto" data-region="table">
        <volt-table>
          <volt-table-header>
            <volt-table-row>
              <volt-table-head>Número de factura</volt-table-head>
              <volt-table-head>Estado del pago</volt-table-head>
              <volt-table-head class="text-right">Importe total</volt-table-head>
            </volt-table-row>
          </volt-table-header>
          <volt-table-body>
            <volt-table-row>
              <volt-table-cell>FAC-2026-000142</volt-table-cell>
              <volt-table-cell>Pendiente de confirmación bancaria</volt-table-cell>
              <volt-table-cell class="text-right">1.250,00 €</volt-table-cell>
            </volt-table-row>
          </volt-table-body>
        </volt-table>
      </div>

      <div class="flex flex-wrap gap-2" data-region="actions">
        <button voltButton id="open-dialog" [voltDialog]="dialog">
          Editar los datos de facturación
        </button>
        <button voltButton variant="outline" id="open-drawer" [voltDrawer]="drawer">
          Відкрити розширені налаштування
        </button>
        <button voltButton variant="ghost">Descartar todos los cambios sin guardar</button>
      </div>
    </div>

    <ng-template #form>
      <form class="grid gap-4" (submit)="$event.preventDefault()" data-region="form">
        <volt-form-field>
          <volt-label
            >Dirección de correo electrónico para las notificaciones de facturación</volt-label
          >
          <volt-input [formControl]="email" type="email" autocomplete="email" />
          <volt-hint
            >Enviaremos aquí las facturas, los recibos y los avisos de renovación
            automática.</volt-hint
          >
          <volt-error
            >Escribe una dirección de correo electrónico válida, por ejemplo
            nombre&#64;empresa.es.</volt-error
          >
        </volt-form-field>
        <volt-form-field>
          <volt-label>Опис робочого простору для нових учасників команди</volt-label>
          <volt-textarea [formControl]="about" [rows]="3" />
        </volt-form-field>
        <volt-form-field>
          <volt-label>Zona horaria predeterminada del espacio de trabajo</volt-label>
          <volt-select [formControl]="zone" placeholder="Selecciona una zona horaria">
            <volt-select-content>
              <volt-select-item value="madrid"
                >Europa/Madrid (hora central europea)</volt-select-item
              >
              <volt-select-item value="kyiv">Європа/Київ (східноєвропейський час)</volt-select-item>
            </volt-select-content>
          </volt-select>
        </volt-form-field>
        <volt-combobox
          label="País de facturación"
          toggleLabel="Mostrar países"
          placeholder="Escribe para buscar un país"
          emptyText="No hay ningún país que coincida."
          [items]="countries"
        />
        <div class="flex flex-wrap justify-end gap-2">
          <button voltButton type="button" variant="outline">Cancelar</button>
          <button voltButton type="submit">Guardar y continuar con la configuración</button>
        </div>
      </form>
    </ng-template>

    <ng-template #dialog let-close="close">
      <div voltDialogOverlay></div>
      <div voltDialogContent data-region="dialog">
        <h2 voltDialogTitle>Editar los datos de facturación de la organización</h2>
        <p voltDialogDescription>Los cambios se aplican a la próxima factura emitida.</p>
        <ng-container [ngTemplateOutlet]="form" />
        <button voltButton variant="ghost" (click)="close()">Cerrar sin guardar</button>
      </div>
    </ng-template>

    <ng-template #drawer>
      <div voltDrawerOverlay></div>
      <div voltDrawerContent side="right" data-region="drawer">
        <div class="flex items-center justify-between gap-2 p-4">
          <h2 voltDrawerTitle>Розширені налаштування робочого простору</h2>
          <volt-drawer-close label="Закрити панель" />
        </div>
        <div class="p-4"><ng-container [ngTemplateOutlet]="form" /></div>
      </div>
    </ng-template>
  `,
})
export class AdaptiveFixture {
  protected readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  protected readonly about = new FormControl('', { nonNullable: true });
  protected readonly zone = new FormControl<string | null>(null);
  protected readonly countries = [
    'España',
    'Україна',
    'Reino Unido de Gran Bretaña e Irlanda del Norte',
  ];
}
