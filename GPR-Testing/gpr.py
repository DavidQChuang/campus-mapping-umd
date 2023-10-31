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


csv_file = pd.read_csv("/Users/shriyanssairy/Desktop/gps_csv_files/combined_file.csv")

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


surf = ax.plot_surface(Xp, Yp, Zp, rstride=1, cstride=1, cmap='jet', linewidth=0, antialiased=False)
plt.xlabel("longitude")
plt.ylabel("latitude")
surf1 = ax2.pcolormesh(Xp, Yp, Zp, cmap='jet')
ax2.set_aspect("equal")
fig.set_size_inches(12,7)
surf2 = ax.scatter(X[:,0], X[:,1], Y, linewidth=0, antialiased=False)
# fig.colorbar(surf, shrink=0.5, aspect=5 )
plt.show()




'''
----------------------------------------------------------
'''

# X_train, Y_train = X, Y

# kernel = C(1.0, (1e-3, 1e3)) * RBF([5,5], (1e-2, 1e2))
# gp = GaussianProcessRegressor(kernel=kernel, n_restarts_optimizer=15)
# gp.fit(X, Y)
# y_pred, MSE = gp.predict(x, return_std=True)
# # model.fit(Y_train, Z_train)

# fig, ax = plt.subplots(subplot_kw={"projection": "3d"})

# X,Y = np.meshgrid(X,Y)

# # Plot the surface.
# surf = ax.plot_surface(X, Y, Z, cmap=cm.coolwarm,
#                        linewidth=1, antialiased=False)

# # Customize the z axis.
# ax.set_zlim(0, 3)
# ax.set_xlim(38.9850,38.9959)
# ax.set_ylim(-76.9444, -76.9320)
# ax.zaxis.set_major_locator(LinearLocator(10))
# # A StrMethodFormatter is used automatically
# ax.zaxis.set_major_formatter('{x:.02f}')

# Add a color bar which maps values to colors.
# fig.colorbar(surf, shrink=0.5, aspect=5)

# plt.show()


'''
----------------------------------------------------------
'''

# plt.scatter([x_value], [predicted_y], label=r"predicted point")
# plt.plot(X, mean_prediction, label="Mean prediction")
# plt.fill_between(
#     X.ravel(),
#     mean_prediction - 1.96 * std_prediction,
#     mean_prediction + 1.96 * std_prediction,
#     alpha=0.5,
#     label=r"95% confidence interval",
# )
# plt.legend()
# plt.xlabel("$x$")
# plt.ylabel("$f(x)$")
# _ = plt.title("Gaussian process regression on noise-free dataset")

