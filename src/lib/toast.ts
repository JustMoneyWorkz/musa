/**
 * Единый стандарт позиционирования toast-уведомлений в приложении.
 *
 * Правило (зафиксировано заказчиком):
 * - Если на экране есть нижний нав-бар (root tabs: home/catalog/favorites/profile) —
 *   toast должен быть НАД ним: bottom = 110px (нав-бар = 24 + 68 + ~18 запас).
 * - Если нав-бара нет (любой полноэкранный overlay: ProductPage, CartPage,
 *   FavoritesPage, OrdersPage, OrderDetailPage, CheckoutPage, AddressesPage,
 *   PaymentPage, SupportPage, AdminPage) — toast у самого низа: bottom = 40px
 *   (16 + 24 safe area).
 *
 * Используй TOAST_BOTTOM_NAVBAR / TOAST_BOTTOM_FLAT вместо магических чисел.
 */

export const TOAST_BOTTOM_NAVBAR = 110
export const TOAST_BOTTOM_FLAT = 40

/** Стиль для статичного toast'а (без проброса контекста). Положи в `style={...}`. */
export const toastStyle = (withNavbar: boolean) => ({
  bottom: withNavbar ? TOAST_BOTTOM_NAVBAR : TOAST_BOTTOM_FLAT,
})
