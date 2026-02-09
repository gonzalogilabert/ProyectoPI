import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';
import Swal from 'sweetalert2';

describe('AlertService', () => {
    let service: AlertService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AlertService);
        // Spy on Swal.fire
        spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    });

    it('should be created (ID 10)', () => {
        expect(service).toBeTruthy();
    });

    it('should call Swal.fire for success (ID 11)', () => {
        service.success('Test Success');
        expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
            icon: 'success',
            text: 'Test Success'
        }));
    });

    it('should call Swal.fire for error (ID 12)', () => {
        service.error('Test Error');
        expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
            icon: 'error',
            text: 'Test Error'
        }));
    });

    it('should validate email format (ID 13)', async () => {
        // We need to test the internal inputValidator function from promptEmail config
        // We can simulate an email prompt and check the validator logic if we can access the call arguments
        service.promptEmail('Test message');

        const lastCall = (Swal.fire as jasmine.Spy).calls.mostRecent();
        const validator = lastCall.args[0].inputValidator;

        expect(validator('')).toBe('¡Debes introducir un correo!');
        expect(validator('user@wrong.com')).toBe('Solo se admiten correos de @campuscamara.es');
        expect(validator('user@campuscamara.es')).toBeNull();
    });
});
