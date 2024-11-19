#!/opt/homebrew/bin/bash

# 1089461675160-compute@developer.gserviceaccount.com

# ./build_tag_push_docker_images.sh
# kubectl apply -f k8s-config-gke/
# kubectl rollout restart deployment frontend
# ws-static 35.226.71.217 EXTERNAL us-central1

# Variables
PROJECT_ID=genai-440722
REPO_NAME=my-repo
REGION=us-central1

# Array of local image names and their tags
declare -A IMAGES
IMAGES=(
  ["frontend"]="frontend/"
  ["backend"]="backend/"
  ["llm_service"]="llm_service/"
)

# Authenticate Docker to Artifact Registry
gcloud auth configure-docker "${REGION}-docker.pkg.dev"

# Loop through the images
for IMAGE in "${!IMAGES[@]}"; do
  DOCKERFILE_DIR="${IMAGES[$IMAGE]}"
  TAG="latest"
  LOCAL_IMAGE="${IMAGE}:${TAG}"
  REMOTE_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE}:${TAG}"

  # Build the Docker image
  if docker buildx build --platform linux/amd64 -t "${LOCAL_IMAGE}" "${DOCKERFILE_DIR}."; then
    echo ">>> Successfully built ${LOCAL_IMAGE}"
  else
    echo ">>> Failed to build ${LOCAL_IMAGE}"
    exit 1
  fi

  # Tag the local image with the Artifact Registry path
  if docker tag "${LOCAL_IMAGE}" "${REMOTE_IMAGE}"; then
    echo ">>> Successfully tagged ${LOCAL_IMAGE} as ${REMOTE_IMAGE}"
  else
    echo ">>> Failed to tag ${LOCAL_IMAGE}"
    exit 1
  fi

  # Push the image to Artifact Registry
  if docker push "${REMOTE_IMAGE}"; then
    echo ">>> Successfully pushed ${REMOTE_IMAGE}"
  else
    echo ">>> Failed to push ${REMOTE_IMAGE}"
    exit 1
  fi
done

# kubectl create secret docker-registry artifact-registry-secret \
#   --docker-server=us-central1-docker.pkg.dev \
#   --docker-username=_json_key \
#   --docker-password="$(cat ./genai-440722-54806f575aa4.json)" \
#   --docker-email=sean.hyun.yang