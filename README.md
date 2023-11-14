# Youbike_Crawler (Youbike2.0)
## How this app works?
1. Install "k3d" with homebrew
2. Run the following command to start the app:
```sh=
k3d cluster create mycluster -s 1 -a 2 -p "30000-30005:30000-30005@server:0"
kubectl apply -f services.yaml
```
3. Check whether the app is running successfully. 
```sh=
kubectl get pod
```
4. Open your browser and test the following url. You can change the parameters to wherever you like in Taipei City. (lng = longitude && lat = latitude)
  -  http://localhost:30005/?lng=121.54&lat=25.02605

5. Delete the app
```sh=
kubectl delete -f services.yaml
k3d cluster delete mycluster
```
