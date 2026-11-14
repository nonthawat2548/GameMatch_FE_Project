export function utf8Length(value) {
  return new Blob([value]).size;
}

export function characterCount(value) {
  return Array.from(value).length;
}

export function passwordError(value) {
  if (characterCount(value) < 8 || utf8Length(value) > 72) {
    return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และไม่เกิน 72 ไบต์';
  }
  return '';
}
