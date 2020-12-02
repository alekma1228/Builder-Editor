import { from } from 'rxjs';
import { delay } from 'rxjs/operators';
import { random } from 'lodash';

export function ImitateHttp(
  target: object,
  propertyName: string,
  propertyDescriptor: PropertyDescriptor,
): PropertyDescriptor {
  const method = propertyDescriptor.value;

  propertyDescriptor.value = function (...args: any[]) {
    return from(method.apply(this, args)).pipe(
      delay(random(300, 500)),
    );
  };
  return propertyDescriptor;
}
