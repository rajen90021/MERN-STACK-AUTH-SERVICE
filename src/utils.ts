export const calculationsDiscount = (price: number, discount: number) => {
  return price - (price * discount) / 100
}
