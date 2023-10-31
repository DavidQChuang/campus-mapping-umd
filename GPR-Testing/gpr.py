from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C, RationalQuadratic as RQ, WhiteKernel as WC
from sklearn import preprocessing
import matplotlib.pyplot as plt
from matplotlib import cm
import numpy as np
import pandas as pd
import os
from matplotlib.ticker import LinearLocator
from itertools import product

X = []
Y = []

max_walking_speed = 8
git_dir = os.getcwd()

csv_file = pd.read_csv(f"{git_dir}/gps_csv_files/combined_file.csv")

long_list = list(csv_file.Longitude)
lat_list = list(csv_file.Latitude)
speed_list = list(csv_file.Speed)

coord_list = list(zip(long_list, lat_list, speed_list))

for x,y,s in coord_list:
    if not np.any(np.isnan(s)) and not np.any(np.isnan(x)) and not np.any(np.isnan(Y)):
        converted_s = s*2.23694
        if converted_s < 10 and converted_s >= 0:
            X.append([x,y])
            Y.append(converted_s)

steps = 50
print(len(X), len(Y))
X = np.array(X)
Y = np.array(Y).reshape(-1,1)

# scaler = preprocessing.StandardScaler().fit(Y)
# Y = scaler.transform(Y)


# Input space
x1 = np.linspace(X[:,0].min(), X[:,0].max(), num = steps) #p
x2 = np.linspace(X[:,1].min(), X[:,1].max(), num = steps) #q
x = (np.array([x1, x2])).T

kernel = C() * RQ()
gp = GaussianProcessRegressor(optimizer='fmin_l_bfgs_b', kernel=kernel, n_restarts_optimizer=50)

x1x2 = np.array(list(product(x1, x2)))

print("Training...")
gp.fit(X, Y)
print("Training completed")

y_pred, MSE2 = gp.predict(x1x2, return_std=True)

# plt.show()

# # Define the input x_value for which you want to make a prediction
# x_value = [-76.938, 38.990] # Replace 5.0 with your desired input value

# # Find the index in X that is closest to x_value
# nearest_index = np.abs(X - x_value).argmin()

# # Use the mean_prediction to get the predicted y value for the input x_value
# predicted_y = y_pred[nearest_index]

# print(f"For x = {x_value}, the predicted y is {predicted_y}")

fig = plt.figure(figsize=(14,7))
ax = fig.add_subplot(121, projection='3d')
ax2 = fig.add_subplot(122)
Xp, Yp = np.meshgrid(x1, x2, indexing='ij')
Zp = np.reshape(y_pred,(steps,steps))


plt.xlabel("longitude")
plt.ylabel("latitude")
surf = ax.plot_surface(Xp, Yp, Zp, rstride=1, cstride=1, cmap='jet', linewidth=0, antialiased=False)
surf1 = ax2.pcolormesh(Xp, Yp, Zp, cmap='jet')
ax2.set_aspect("equal")
fig.set_size_inches(12,7)
surf2 = ax.scatter(X[:,0], X[:,1], Y, linewidth=0, antialiased=False)
# fig.colorbar(surf, shrink=0.5, aspect=5 )
plt.show()
