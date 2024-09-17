# Use an official Python runtime as a parent image
FROM node:18-alpine3.20

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN yarn install

EXPOSE 5000

# Run app.py when the container launches
CMD ["node", "index.js"]