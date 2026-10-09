# ── Stage 1: build ──────────────────────────────────────────────
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# Copy pom first — Docker caches this layer, so deps only re-download
# when pom.xml actually changes (not every code change)
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -q

COPY src src
RUN ./mvnw package -DskipTests -q

# ── Stage 2: runtime ─────────────────────────────────────────────
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/happyhealth-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]