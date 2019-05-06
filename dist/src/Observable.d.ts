import { Subscription } from './Subscription';
export interface Observable<T> {
    subscribe: (next: (value: T) => void, fail?: (err: Error) => void, comp?: () => void) => Subscription;
}
