import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
<<<<<<< HEAD
    provideZoneChangeDetection({ eventCoalescing: true }),
=======
<<<<<<< HEAD
    provideZoneChangeDetection({ eventCoalescing: true }), 
=======
    provideZoneChangeDetection({ eventCoalescing: true }),
>>>>>>> 4e456ae (Front: correção de bugs e atualizações)
>>>>>>> 3701c4f982dc1f66370f082dd01db1137a08470a
    provideRouter(routes),
    provideHttpClient()
  ]
};
