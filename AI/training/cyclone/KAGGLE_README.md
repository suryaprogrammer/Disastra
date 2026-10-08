# Disastra Cyclone Training for Kaggle

This directory contains the Kaggle-ready training package for the Disastra Cyclone YOLO model.

## Included Files
- `kaggle_cyclone_training.ipynb`: The main Jupyter Notebook intended for execution within Kaggle environments.
- `kaggle_cyclone_train.py`: A Python script equivalent for automated script-based execution inside Kaggle.

## How to use on Kaggle

1. **Upload Dataset:** Upload the `Cyclone.zip` dataset to your Kaggle environment via the **Add Data** > **Upload Data** interface, and name the dataset `disastra-cyclone`.
2. **Upload Notebook:** Import `kaggle_cyclone_training.ipynb` into a new Kaggle Notebook.
3. **Environment Setup:** Make sure the notebook accelerator is set to **GPU** in the Kaggle session settings (usually a P100 or T4).
4. **Execution:** Run the cells sequentially. The full training cell and the smoke test cell are separated; the smoke test can be safely skipped or run independently for verification. 

## Outputs
All training outputs, metrics, predictions, and model checkpoints (`best.pt`, `last.pt`) will be saved strictly to the `/kaggle/working/disastra_cyclone` directory, leaving the original dataset pristine. A final `Disastra_Cyclone_YOLO26s.zip` archive containing the best weights and metrics will be produced at the end.
