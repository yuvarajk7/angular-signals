import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { LoadingService } from "./loading.service";
import { finalize } from "rxjs";
import { inject } from "@angular/core";
import { SkipLoading } from "./skip-loading.component";

export const loadingInterceptor : HttpInterceptorFn = 
    (request: HttpRequest<unknown>, next: HttpHandlerFn) => {

        if(request.context.get(SkipLoading)) {
            return next(request);
        }

        const loadingService = inject(LoadingService);
        loadingService.loadingOn();
        return next(request)
            .pipe(
                finalize(() => {
                    loadingService.loadingOff()
                })
            );
}