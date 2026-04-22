import React, { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { CarMakersData, CarModelProps } from "@lib/types";
import ModelItem from "./model-item";
import MoreDetails from "./more-details";
import { GenerationForm } from "./generation-form";
const ModelsList = ({
  carMaker,
  setModelToEdit,
  setModel,
}: {
  carMaker: CarMakersData | null;
  setModel: React.Dispatch<React.SetStateAction<CarModelProps | null>>;
  setModelToEdit: React.Dispatch<
    React.SetStateAction<CarModelProps | undefined>
  >;
}) => {
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [genToEdit, setGenToEdit] = useState<{
    modelId: number;
    genId: number;
  } | null>(null);
  const [modelGenId, setModelGenId] = useState<number | null>(null); // we are setting this state to a model id

  const selectedModel = carMaker?.carModels.find(
    (model) => model.id === selectedModelId
  );
  const relatedModelToGen = carMaker?.carModels.find(
    (model) => model.id === modelGenId
  );
  const model = carMaker?.carModels.find(
    (model) => model.id === genToEdit?.modelId
  );
  const generationToEdit = model?.carGenerations.find(
    (gen) => gen.id === genToEdit?.genId
  );
  return (
    <div>
      <h3 className="sm:text-xl md:text-2xl font-semibold mb-3">Models</h3>
      <AnimatePresence mode="wait">
        {carMaker?.carModels.length ? (
          <motion.ul
            key="models-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.09 }}
            className="flex items-center justify-center  gap-3 flex-wrap"
          >
            {carMaker.carModels.map((model) => (
              <ModelItem
                key={model.id}
                setSelectedModelId={setSelectedModelId}
                carMaker={carMaker}
                item={model}
                setModelToEdit={() => setModelToEdit(model)}
                setModelId={() => setModel(model)}
              />
            ))}
          </motion.ul>
        ) : (
          <p
            key="no-model"
            className="text-muted-foreground w-full text-center"
          >
            No Models
          </p>
        )}
      </AnimatePresence>
      <MoreDetails
        open={!!selectedModel}
        setAddGenOpen={setModelGenId}
        setGentoEdit={setGenToEdit}
        setOpen={() => setSelectedModelId(null)}
        item={selectedModel}
      />

      {/* {model || relatedModelToGen ? ( */}
      <GenerationForm
        open={!!genToEdit || !!modelGenId}
        setOpen={() => {
          setGenToEdit(null);
          setModelGenId(null);
          setSelectedModelId(model?.id || relatedModelToGen?.id || null);
        }}
        genToEdit={generationToEdit}
        model={model || relatedModelToGen}
        // open={!!genToEdit}

        setMainOpen={() => setGenToEdit(null)}
      />
      {/* ) : null} */}
    </div>
  );
};

export default ModelsList;
