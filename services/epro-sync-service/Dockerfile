FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY main.go ./
RUN go mod init epro-sync-service && go build -o epro-sync-service main.go

FROM alpine:latest

WORKDIR /app
COPY --from=builder /app/epro-sync-service .

EXPOSE 8084

CMD ["./epro-sync-service"]
