
docker build -t bevyhr-frontend .
docker run -p 3000:3000 bevyhr-frontend


# Create a non-root user
RUN addgroup -S nonroot && adduser -S nonroot -G nonroot
USER nonroot
