import {Injectable, signal} from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class LoadingService {

  #loadingSignal = signal(false);

  loading = this.#loadingSignal.asReadonly();

  loadingOn(): void {
    this.#loadingSignal.set(true);
  }

  loadingOff(): void {
    this.#loadingSignal.set(false);
  } 

}
