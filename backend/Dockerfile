# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the application, skipping tests to speed up the build
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /app/target/chatmits-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the port the backend runs on
EXPOSE 8080

# Environment variables for production tuning
ENV JAVA_OPTS="-Xms1024m -Xmx2048m"

# Command to run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
