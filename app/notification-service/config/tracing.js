import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import fs from "fs";
import path from "path";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { resourceFromAttributes } = require("@opentelemetry/resources");

const SERVICE_NAME = "notification-service";

class FileSpanExporter {
  constructor() {
    this.filePath = path.join(process.cwd(), "tracing.txt");
  }

  export(spans, resultCallback) {
    for (const span of spans) {
      const startMs = span.startTime[0] * 1000 + span.startTime[1] / 1000000;
      const endMs = span.endTime[0] * 1000 + span.endTime[1] / 1000000;
      const duration_ms = Math.round(endMs - startMs);

      const startDate = new Date(startMs);
      const hours = String(startDate.getHours()).padStart(2, "0");
      const minutes = String(startDate.getMinutes()).padStart(2, "0");
      const seconds = String(startDate.getSeconds()).padStart(2, "0");
      const milliseconds = String(startDate.getMilliseconds()).padStart(3, "0");
      const startTimeString = `${hours}:${minutes}:${seconds}.${milliseconds}`;

      const traceData = {
        traceId: span.spanContext().traceId,
        spanId: span.spanContext().spanId,
        parentSpanId: span.parentSpanId || null,
        service: SERVICE_NAME,
        startTime: startTimeString,
        duration_ms: duration_ms,
      };

      fs.appendFileSync(this.filePath, JSON.stringify(traceData) + "\n", "utf8");
    }
    resultCallback({ code: 0 });
  }

  shutdown() {
    return Promise.resolve();
  }
}

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    "service.name": SERVICE_NAME,
  }),
  traceExporter: new FileSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  // instrumentations: [
  //   getNodeAutoInstrumentations({
  //     "@opentelemetry/instrumentation-winston": {
  //       enabled: false, // Tắt việc tự động chèn trace_id vào log winston
  //     },
  //   }),
  // ],
});

sdk.start();
console.log(`Khởi động OpenTelemetry Tracing cho ${SERVICE_NAME}`);