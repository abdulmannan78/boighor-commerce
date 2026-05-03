# Boighor Commerce

Vite + React ecommerce prototype for selling books online in Bangladesh.

## Features

- 100-book seeded catalog inspired by Bangladeshi online bookstore categories
- Product search, category filter, sorting, cart, and checkout
- Store management dashboard with revenue, inventory, and restock actions
- Delivery management with courier/status updates
- Payment simulation for bKash, Nagad, Visa, and Mastercard
- Billing module with printable invoices

## Run locally

```bash
npm install
npm run dev
```

Then open the Vite local URL shown in the terminal.

## Run with Docker

```bash
docker compose up --build
```

Then open:

```text
http://localhost:8080
```

Or build and run manually:

```bash
docker build -t boighor-commerce .
docker run --rm -p 8080:80 boighor-commerce
```

## GitHub Container Registry

After this project is pushed to GitHub, the workflow in `.github/workflows/docker-image.yml` can build and publish:

```text
ghcr.io/<your-github-username-or-org>/boighor-commerce:latest
```

## AlmaLinux Deployment

For the Docker server at `172.16.0.170`, see:

```text
DEPLOY_ALMALINUX.md
```

## Notes

The payment gateways are frontend simulations. Real bKash, Nagad, Visa, and Mastercard integration requires backend API routes, merchant credentials, webhook verification, and secure server-side order validation.
