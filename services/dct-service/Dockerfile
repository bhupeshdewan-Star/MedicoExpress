FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY main.go ./
RUN go mod init dct-service && go build -o dct-service main.go

FROM alpine:latest

WORKDIR /app
COPY --from=builder /app/dct-service .

EXPOSE 8083

CMD ["./dct-service"]
