# Use Python 3.13 as the base image
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

# Set working directory
WORKDIR /app

# Copy the project files
COPY . .

# Install dependencies using uv
RUN uv sync --frozen
RUN uv pip install .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uv", "run", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"] 