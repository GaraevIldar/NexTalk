# Elastic Alert Setup — Error Log Email Notification

Kibana Stack Management → Rules → Create rule.  
UI path (after cluster is up): `http://<node-ip>/monitoring/kibana`

---

## Prerequisites

- ELK stack deployed (`k8s/14-elasticsearch.yaml`, `k8s/15-kibana.yaml`, `k8s/16-filebeat.yaml`)
- Logs flowing into index `nextalk-logs-*` (verify via **Discover**)
- SMTP server accessible from the Kibana pod

---

## Step 1 — Configure email connector

1. Open **Stack Management → Connectors → Create connector**
2. Select **Email**
3. Fill in:
   | Field | Value |
   |---|---|
   | Name | `SMTP Alert` |
   | Host | `<smtp-host>` |
   | Port | `587` |
   | Secure | TLS |
   | Username | `<smtp-user>` |
   | Password | `<smtp-password>` |
   | From | `alerts@<your-domain>` |
4. Click **Test** → **Save**

---

## Step 2 — Create the alert rule

1. Open **Stack Management → Rules → Create rule**
2. Select rule type: **Elasticsearch query**
3. Configure:

   | Setting | Value |
   |---|---|
   | Name | `NexTalk Error Logs` |
   | Index | `nextalk-logs-*` |
   | Time field | `@timestamp` |
   | Check every | `1 minute` |
   | Notify | `Every time rule is active` |

4. **Query** (KQL):
   ```
   log.level: "error" OR level: "Error"
   ```
   Or as Elasticsearch JSON query:
   ```json
   {
     "query": {
       "bool": {
         "should": [
           { "term": { "log.level": "error" } },
           { "term": { "level": "Error" } }
         ],
         "minimum_should_match": 1
       }
     }
   }
   ```

5. **Threshold**: `IS ABOVE 0` in the last `1 minute`

6. Under **Actions** → select the `SMTP Alert` connector:
   - **To**: `<recipient@your-domain>`
   - **Subject**: `[NexTalk] Error detected in logs`
   - **Body**:
     ```
     {{context.title}}

     Detected {{context.hits}} error log(s) in the last minute.

     Service: {{context.hits.hits.0._source.kubernetes.labels.app}}
     Message: {{context.hits.hits.0._source.message}}
     Time: {{context.hits.hits.0._source.@timestamp}}

     View in Kibana: {{context.link}}
     ```

7. Click **Save**

---

## Step 3 — Verify logs are indexed

In **Discover**, set index pattern `nextalk-logs-*` and search:
```
log.level: "error"
```

To generate a test error log, call a non-existent endpoint or trigger a validation error in guild-service. Serilog will emit a structured JSON error log which Filebeat ships to Elasticsearch.

---

## Serilog JSON log format (reference)

All NexTalk services emit compact JSON via `Serilog.Formatting.Compact`:
```json
{
  "@t": "2024-01-15T10:30:00.000Z",
  "@mt": "Cache miss for key {Key}. Stored: {Value}",
  "@l": "Information",
  "Key": "probe:shared",
  "Value": "set by guild-service-7f9d8 at 2024-01-15T10:30:00Z",
  "MachineName": "guild-service-7f9d8-xk2p1"
}
```

Error logs use `@l: "Error"`. Filebeat's `decode_json_fields` processor decodes the `message` field, so Elasticsearch receives all structured fields for filtering.
