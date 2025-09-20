# Application Operational Cost Estimate

This document provides a rough estimate of the ongoing operational costs for using the Google Vertex AI services, which are the core of this application's functionality.

**Disclaimer:** This is not a formal quote. Prices for cloud services can change, and actual usage will vary. This estimate does not include one-time development costs (e.g., developer salaries).

### AI Model and Pricing

The application exclusively uses the `gemini-2.5-pro` model from Google Cloud's Vertex AI platform. The cost is calculated based on pay-as-you-go pricing.

**Pricing Assumptions (as of mid-2024, converted to INR):**
*   **Input Text:** ₹0.0104 per 1,000 characters
*   **Output Text:** ₹0.0311 per 1,000 characters
*   **Audio Input:** ₹0.664 per minute
*   _(Based on 1 USD ≈ 83 INR)_

### Cost Breakdown per Full User Session

A "full session" assumes a user goes through every step and interacts with the features.

| Feature                 | AI Action                    | Input (Approx.)     | Output (Approx.)    | Est. Cost (INR) |
| :---------------------- | :--------------------------- | :------------------ | :------------------ | :-------------- |
| Document Summary        | `summarizeLegalDocument`     | 20k chars           | 2k chars            | **₹0.27**       |
| Verbal Context          | `transcribeAndAnalyzeAudio`  | 1 min audio         | 2k chars            | **₹0.73**       |
| Goal Parsing            | `parseUserGoals`             | 0.5k chars          | 0.5k chars          | **₹0.02**       |
| Risk Analysis           | `identifyLegalRisks`         | 25k chars           | 5k chars            | **₹0.41**       |
| Risk Narration (x3)     | `narrateRisk`                | 1k chars (each)     | 1k chars (each)     | **₹0.12**       |
| RAG Bot Queries (x5)    | `askQuery`                   | 21k chars (each)    | 1k chars (each)     | **₹1.24**       |
| **-------------------** | **------------------------** | **---------------** | **---------------** | **-----------** |
| **Total per Session**   |                              |                     |                     | **≈ ₹2.79**     |

### Scaled Estimates

*   **Cost per 100 User Sessions:** 100 * ₹2.79 = **₹279 INR**
*   **Cost per 1,000 User Sessions:** 1,000 * ₹2.79 = **₹2,790 INR**
*   **Cost per 10,000 User Sessions:** 10,000 * ₹2.79 = **₹27,900 INR**

### Key Takeaways

*   The cost per user is very low, making the application highly scalable.
*   The most significant costs are associated with the **RAG Bot** (due to re-sending the document context with each query) and **Verbal Context** (due to audio processing).
*   These costs do not include other platform fees like web hosting, which are typically minor for this scale of application.
*   Always check the official [Google Cloud Vertex AI Pricing](https://cloud.google.com/vertex-ai/pricing) page for the most current information.
