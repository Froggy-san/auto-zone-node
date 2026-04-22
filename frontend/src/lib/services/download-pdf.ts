type DownloadType = "inSamePage" | "separate";

export default async function downloadAsPdf(
  ids: number[],
  type: DownloadType = "inSamePage"
) {
  const idsArr = JSON.stringify(ids);
  const response = await fetch(`/api/pdf?ids=${idsArr}&type=${type}`);

  if (!response.ok) {
    const error = await response.json();
    console.error(error.error);
    throw new Error(error.error);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `service_receipt_${ids.join(",")}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
