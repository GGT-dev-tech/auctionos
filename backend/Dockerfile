# Build stage
FROM mcr.microsoft.com/playwright/python:v1.41.0-jammy as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc pkg-config default-libmysqlclient-dev libpq-dev build-essential python3-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt


# Final stage
FROM mcr.microsoft.com/playwright/python:v1.41.0-jammy

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && \
    apt-get install -y --no-install-recommends default-libmysqlclient-dev libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

RUN pip install --no-cache /wheels/*

COPY . .

# Ensure browsers are installed
RUN playwright install chromium

# Copy data directory (containing netronline_data.csv)
COPY data/ /app/data/

# Create data directory and set permissions
RUN mkdir -p /app/data/media /app/data/reports && chmod -R 777 /app/data

COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
