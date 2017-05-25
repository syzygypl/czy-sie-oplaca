export default function translate(item) {
  switch (item) {
    case '__unknown__':
      return 'OTHER';
    default:
      return item;
  }
}
