/** Assemble des noms de classes en ignorant les valeurs vides : cx('a', cond && 'b') */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
