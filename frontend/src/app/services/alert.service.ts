import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    constructor() { }

    // Alerta de éxito minimalista
    success(message: string, title: string = 'Éxito') {
        Swal.fire({
            title: title,
            text: message,
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6', // Color limpio
            buttonsStyling: true,
            customClass: {
                popup: 'animated fadeInDown faster' // Animación rápida
            }
        });
    }

    // Alerta de error minimalista
    error(message: string, title: string = 'Error') {
        Swal.fire({
            title: title,
            text: message,
            icon: 'error',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#d33',
        });
    }

    // Alerta informativa
    info(message: string, title: string = 'Info') {
        Swal.fire({
            title: title,
            text: message,
            icon: 'info',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
        });
    }

    // Confirmación minimalista
    async confirm(message: string, title: string = '¿Estás seguro?'): Promise<boolean> {
        const result = await Swal.fire({
            title: title,
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });
        return result.isConfirmed;
    }

    async promptEmail(message: string, title: string = 'Identificación Requerida'): Promise<string | null> {
        const { value: email } = await Swal.fire({
            title: title,
            text: message,
            input: 'email',
            inputLabel: 'Tu correo institucional (@campuscamara.es)',
            inputPlaceholder: 'ejemplo@campuscamara.es',
            confirmButtonText: 'Verificar',
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false,
            allowEscapeKey: false,
            inputValidator: (value) => {
                if (!value) {
                    return '¡Debes introducir un correo!';
                }
                if (!value.endsWith('@campuscamara.es')) {
                    return 'Solo se admiten correos de @campuscamara.es';
                }
                return null;
            }
        });
        return email || null;
    }
}
