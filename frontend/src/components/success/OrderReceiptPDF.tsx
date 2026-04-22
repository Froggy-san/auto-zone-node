import { Order } from "@lib/types";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Svg,
  Path,
  Rect,
  Circle,
  Polyline,
} from "@react-pdf/renderer";
import { Calendar } from "lucide-react";

const MUTED_TEXT = "#71717a";
const TEXT_COLOR = "#18181b";
const backgroundColor = "#f4f4f5";
const borderColor = "#e4e4e7";
{
  /* <svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="lucide lucide-calendar-icon lucide-calendar"
>
  <path d="M8 2v4" />
  <path d="M16 2v4" />
  <rect width="18" height="18" x="3" y="4" rx="2" />
  <path d="M3 10h18" />
</svg>; */
}
const PackageIcon = ({ color = MUTED_TEXT, size = 24 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Outer box structure */}
    <Path
      d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"
      fill="none"
    />

    {/* Vertical center line */}
    <Path d="M12 22V12" fill="none" />

    {/* Top opening (the V shape) */}
    <Polyline points="3.29 7 12 12 20.71 7" fill="none" />

    {/* Accent line on the lid */}
    <Path d="m7.5 4.27 9 5.15" fill="none" />
  </Svg>
);

const ClockIcon = ({ color = MUTED_TEXT, size = 24 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none" // Prevents the interior from turning black
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* The outer circle of the clock */}
    <Circle cx="12" cy="12" r="10" fill="none" />

    {/* The clock hands (L-shape) */}
    <Path d="M12 6v6l4 2" fill="none" />
  </Svg>
);
const CalendarIcon = ({ color = TEXT_COLOR, size = 24 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none" // Essential: stops the "black box" effect
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Main calendar body */}
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" />

    {/* Horizontal line across the top */}
    <Path d="M3 10h18" fill="none" />

    {/* Left prong */}
    <Path d="M8 2v4" fill="none" />

    {/* Right prong */}
    <Path d="M16 2v4" fill="none" />
  </Svg>
);
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1a1a1a",
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  orderBadge: {
    backgroundColor: backgroundColor,
    color: TEXT_COLOR,
    fontWeight: 600,
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    // lineHeight: "19.2px",
    paddingHorizontal: "16px",
    paddingVertical: "6px",
    borderRadius: "14px",
    alignSelf: "center",
    marginTop: 8,
  },
  orderBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
    padding: "24px",
    border: "1px",
    borderColor: borderColor,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",

    color: "#333",
  },
  pickupSection: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    gap: "16px",
    padding: "24px",
    borderRadius: "12px",
    borderColor: "#e4e4e7",
    borderWidth: "1px",
    color: "#09090b",
    marginBottom: "24px",
  },
  pickupLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 4,
  },
  pickupDate: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  pickupTime: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "3px",
    fontSize: 11,
    color: "#666",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingBottom: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
  },
  itemRowLast: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  quantityBadge: {
    width: 20,
    height: 20,
    fontSize: "12px",

    fontWeight: 500,
    borderRadius: 10,
    backgroundColor: backgroundColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  quantityText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    maxWidth: "80%",

    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 10,
    color: "#666",
  },
  discountText: {
    color: "#22c55e",
    fontSize: 10,
  },
  itemRight: {
    textAlign: "right",
  },
  originalPrice: {
    fontSize: 10,
    color: "#999",
    textDecoration: "line-through",
  },
  finalPrice: {
    fontSize: 11,
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f4f4f5",
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  twoColumn: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  column: {
    flex: 1,
    padding: 16,
    border: "1px",
    borderColor: borderColor,
    borderRadius: "14px",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  detailLabel: {
    marginTop: 6,
    fontSize: 10,
    color: "#666",
  },
  detailValue: {
    fontSize: 10,
    fontWeight: "bold",
    // textAlign: "right",
  },
  paidBadge: {
    backgroundColor: "#e6f7e6",
    padding: "2 8",
    borderRadius: 4,
  },
  paidText: {
    fontSize: 10,
    color: "#22c55e",
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerText: {
    fontSize: 10,
    color: "#666",
  },
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  discount: number;
}

interface OrderReceiptPDFProps {
  order: Order;
}

const OrderReceiptPDF = ({ order }: OrderReceiptPDFProps) => {
  const pickupDate = order.pickupDate ? new Date(order.pickupDate) : new Date();
  const orderDate = new Date(order.created_at);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Order Confirmed!</Text>
          <Text style={styles.subtitle}>
            Thank you for your order. Here&apos;s your receipt.
          </Text>
          <View style={styles.orderBadge}>
            <Text style={styles.orderBadgeText}>Order #{order.id}</Text>
          </View>
        </View>

        {/* Pickup Section */}
        <View style={styles.pickupSection}>
          <View
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarIcon size={18} />
          </View>
          <View>
            <Text style={styles.pickupLabel}>Pickup Date</Text>

            <Text style={styles.pickupDate}>
              {" "}
              {order.payment_method.toLowerCase() === "card"
                ? "Your order has been booked, you can pick it up at anytime."
                : formatDate(pickupDate)}
            </Text>
            <View style={styles.pickupTime}>
              <ClockIcon size={10} />
              <Text>
                {order.payment_method.toLowerCase() === "card"
                  ? "Unspecified"
                  : formatTime(pickupDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "3px",
              marginBottom: "32px",
            }}
          >
            <PackageIcon size={15} />
            <Text style={styles.sectionTitle}> Order Summary</Text>
          </View>
          {order.items?.items.map((item: any, index: number) => {
            const originalTotal = item.listPrice * item.quantity;
            const discountTotal = item.salePrice * item.quantity;
            const finalTotal = originalTotal - discountTotal;
            // const isLast = index === order.items.length - 1;

            return (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      {formatCurrency(item.listPrice)} each
                      {item.salePrice > 0 && (
                        <Text style={styles.discountText}>
                          {" "}
                          (-{formatCurrency(
                            item.listPrice - item.salePrice,
                          )}{" "}
                          discount)
                        </Text>
                      )}
                    </Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  {item.salePrice > 0 ? (
                    <>
                      <Text style={styles.originalPrice}>
                        {formatCurrency(originalTotal)}
                      </Text>
                      <Text style={styles.finalPrice}>
                        {formatCurrency(discountTotal)}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.finalPrice}>
                      {formatCurrency(finalTotal)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(order.total_amount)}
            </Text>
          </View>
        </View>

        {/* Customer & Payment Details */}
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <Text style={{ ...styles.detailValue, marginTop: 6 }}>
              {order.customer_details.name}
            </Text>
            <Text style={styles.detailLabel}>
              {order.customer_details.email}
            </Text>
            <Text style={styles.detailLabel}>
              {order.customer_details.phone}
            </Text>
            {order.customer_details.address && (
              <Text style={styles.detailLabel}>
                {order.customer_details.address}
              </Text>
            )}
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Method</Text>
              <Text style={styles.detailValue}>
                {order.payment_method.charAt(0).toUpperCase() +
                  order.payment_method.slice(1)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Status</Text>
              <View style={styles.paidBadge}>
                <Text style={styles.paidText}>
                  {order.payment_status

                    .replace(/_/g, " ")
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim()}
                </Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Status</Text>
              <View style={styles.paidBadge}>
                <Text style={styles.paidText}>
                  {order.order_status

                    .replace(/_/g, " ")
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim()}
                </Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(orderDate)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Questions about your order? Contact us at support@example.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default OrderReceiptPDF;
