docker container run -it --rm --name nest --privileged=true -p 3000:8060 -v $(pwd)/nest:/autorizador-nest autorizador-nest:v1 /bin/bash