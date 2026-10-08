# TyphoonSat

## TyphoonSat Dataset Description  
TyphoonSat is a dataset designed for tropical cyclone detection in the Northwest Pacific region. Based on observations from Himawari-8/9 satellites and the best-track data provided by the China Meteorological Administration, this dataset includes satellite cloud images and corresponding tropical cyclone labels. 

## Data Description 
### 1. This dataset consists of three subsets - TC, TS+, TCs, which are used for different tasks.
* (1) TC dataset (coarse detection, all intensities merged). All six tropical cyclone intensity levels—TD, TS, STS, TY, STY, and SuperTY—were merged into a single category labeled "0". This dataset retains the original split of 4375/482/533 images for training, validation, and testing, respectively, and serves to evaluate the model's fundamental ability to detect tropical cyclones regardless of intensity.
* (2) TS+ dataset (coarse detection, TS and stronger systems only). Only five intensity levels—TS, STS, TY, STY, and SuperTY—were retained, while TD samples were excluded. All retained categories were merged into a single label "0". This dataset contains 3365 training, 383 validation, and 415 test samples. It is designed to assess model performance on meteorologically significant systems (tropical storm intensity and above), excluding weak disturbances that are of less operational concern.
* (3) TCs dataset (fine-grained detection, six intensity levels). All six intensity levels were preserved as distinct categories, labeled sequentially from 0 to 5 corresponding to TD, TS, STS, TY, STY, and SuperTY, respectively. The data split remains identical to the original dataset (4375/482/533). This dataset enables evaluation of the model's capability to discriminate between adjacent intensity grades—a more challenging task than binary detection.
### 2. The "images" folder contains satellite cloud images in PNG format, named with timestamps (e.g., 2015010100.png), and includes three sub-datasets: train, val, and test, representing the training, validation, and testing sets, respectively.
### 3. The "labels" folder contains tropical cyclone labels in TXT format, also named with timestamps (e.g., 2015010100.txt), and similarly includes train, val, and test sub-datasets.
### 4. Labels are in YOLO format, allowing YOLO models to be used as baseline models for evaluation. 
### 5. The "data.yaml" file is a configuration file that sets the addresses of images and labels, and defines the category information of the labels. 
### 6. The "yolo2coco.py" file can convert YOLO-formatted annotations to COCO JASON format.