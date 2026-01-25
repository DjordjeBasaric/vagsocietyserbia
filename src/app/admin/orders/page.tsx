import type { Order } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { updateOrderStatus } from "@/app/actions/order-actions";
import { AdminShell } from "@/app/admin/AdminShell";

export const dynamic = "force-dynamic";

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="glass-panel rounded-3xl p-6">
      <div className="space-y-2">
        <p className="text-xs text-slate-500">
          {order.fullName} · {order.email}
        </p>
        <p className="text-sm text-slate-500">{order.phone}</p>
        <p className="text-lg text-slate-900">{order.productNameSnapshot}</p>
        <p className="text-sm text-slate-500">
          Količina: {order.quantity} · {formatPrice(order.unitPriceCents)}
        </p>
        <p className="text-sm text-slate-600">
          Ukupno: {formatPrice(order.unitPriceCents * order.quantity)}
        </p>
        <p className="text-xs text-slate-400">
          {order.createdAt.toLocaleDateString("sr-RS")} · {order.shippingAddress}
        </p>
      </div>
      <form
        action={updateOrderStatus}
        className="mt-4 flex flex-wrap items-center gap-2"
      >
        <input type="hidden" name="orderId" value={order.id} />
        <select
          name="status"
          defaultValue={order.status}
          className="field max-w-[180px]"
        >
          <option value="PENDING">Na čekanju</option>
          <option value="DECLINED">Odbijeno</option>
          <option value="SHIPPED">Poslato</option>
        </select>
        <button type="submit" className="button-outline">
          Sačuvaj
        </button>
      </form>
    </div>
  );
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pendingOrders = orders.filter((order) => order.status === "PENDING");
  const declinedOrders = orders.filter((order) => order.status === "DECLINED");
  const shippedOrders = orders.filter((order) => order.status === "SHIPPED");

  return (
    <AdminShell
      title="Narudžbine"
      subtitle="Upravljanje statusom narudžbina"
      active="orders"
    >
      {orders.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 text-slate-600">
          Nema narudžbina.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg text-slate-900">Na čekanju</h3>
              <span className="chip">{pendingOrders.length}</span>
            </div>
            {pendingOrders.length === 0 ? (
              <div className="glass-panel rounded-3xl p-6 text-slate-600">
                Nema narudžbina na čekanju.
              </div>
            ) : (
              pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg text-slate-900">Odbijene</h3>
              <span className="chip">{declinedOrders.length}</span>
            </div>
            {declinedOrders.length === 0 ? (
              <div className="glass-panel rounded-3xl p-6 text-slate-600">
                Nema odbijenih narudžbina.
              </div>
            ) : (
              declinedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg text-slate-900">Poslate</h3>
              <span className="chip">{shippedOrders.length}</span>
            </div>
            {shippedOrders.length === 0 ? (
              <div className="glass-panel rounded-3xl p-6 text-slate-600">
                Nema poslatih narudžbina.
              </div>
            ) : (
              shippedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
