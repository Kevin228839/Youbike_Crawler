# Youbike_Crawler (Youbike2.0)

## How this app works?

1. Install "k3d" with homebrew
2. Run the following command to start the app:

```sh=
k3d cluster create myCluster -s 1 -a 1 -p "80:80@loadbalancer"
helm install demo helm
```

3. Check whether the app is running successfully.

```sh=
kubectl get pod
```

4. Open your browser and test the following url. You can change the parameters to wherever you like in Taipei City. (lng = longitude && lat = latitude)

- http://localhost/?lng=121.54282&lat=25.02351

5. Clean up

```sh=
helm uninstall demo
k3d cluster delete myCluster
```
