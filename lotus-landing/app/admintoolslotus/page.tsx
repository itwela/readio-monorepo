"use client"

import { AnimatedList } from "@/components/magicui/animated-list"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Image from "next/image"
import { useEffect, useState } from "react"
import { defaultLotusArticle, full_Prompt_To_Generate_Lotus_Article } from "./models/defaultInfo"
import { AudioModel, audioModels, estimateCostOfAudioResponse, estimateCostOfInput, estimateCostOfOutput, ImageModel, imageModels, TextModel, textModels } from "./models/modelData"

// Main component
export default function AdminToolsPageClient() {

    // #region Authentication State
    const [pw, setPw] = useState("TEAMWORKLOTUS100")
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [customArticleCount, setCustomArticleCount] = useState(0)
    const adminPass = process.env.NODE_ENV === 'development'
        ? process.env.NEXT_PUBLIC_ADMIN_PASS
        : process.env.ADMIN_PASS

    useEffect(() => {
        if (pw === adminPass) {
            setIsAuthorized(true)
        } else {
            setIsAuthorized(false)
        }
    }, [pw, adminPass])
    // #endregion

    // #region Text Model State and Calculations
    const [selectedTextModel, setSelectedTextModel] = useState<TextModel>();
    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");

    const inputCost = estimateCostOfInput(inputText, selectedTextModel?.name as string);
    const outputCost = estimateCostOfOutput(outputText, selectedTextModel?.name as string);

    const handleCustomArticleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        setCustomArticleCount(value);
    };
    // #endregion

    // #region Image Model State
    const [selectedImageModel, setSelectedImageModel] = useState<ImageModel>();
    const imageOutputCost = selectedImageModel?.costPerImage as number;
    // #endregion

    // #region Audio Model State and Calculations
    const [selectedAudioModel, setSelectedAudioModel] = useState<AudioModel>();
    const [averageArticleLength, setAverageArticleLength] = useState(90);

    const audioOutputCost = estimateCostOfAudioResponse(
        selectedAudioModel?.costPerGeneration,
        selectedAudioModel?.costPerSecond,
        averageArticleLength,
        selectedAudioModel?.name as string,
    );

    // #endregion

    const totalCost = (inputCost ?? 0) + (outputCost ?? 0) + (selectedImageModel?.costPerImage ?? 0) + (audioOutputCost ?? 0);
    const customCost = customArticleCount * (totalCost);

    // #region Render Methods
    if (isAuthorized) {
        return (
            <div className="min-h-screen no-scrollbar bg-gradient-to-br from-slate-900 w-screen via-slate-800 to-slate-900">
                <div className="max-w-[95%] no-scrollbar sm:max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-4xl no-scrollbar font-bold text-white mb-6 tracking-tight">
                        AI Cost Playground
                        <span className="block text-base font-normal text-slate-400 mt-1">AI Model Selection & Cost Analysis To Find True Costs Of Your Potential AI Products.</span>
                    </h1>

                    <div className="grid no-scrollbar grid-cols-1 xl:grid-cols-3 gap-4">
                        {/* Text Model Card */}
                        <div className="bg-white/10 no-scrollbar flex flex-col justify-between h-full backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg">

                            <span className="">

                                <div className="flex items-center no-scrollbar justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-1">Text Model</h2>
                                        <p className="text-sm text-slate-400">Select and configure text generation</p>
                                    </div>
                                    <div className="flex items-center flex-col gap-2">
                                        {selectedTextModel && (
                                            <>
                                                <a target="_blank" href={selectedTextModel?.modelLink} className="">
                                                    <Image
                                                        src={selectedTextModel.modelImg}
                                                        alt=""
                                                        width={40}
                                                        height={40}
                                                        className="rounded-lg shadow-lg"
                                                    />
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Select onValueChange={(value) => {
                                    const model = textModels.find(m => m.id.toString() === value);
                                    if (model) {
                                        setSelectedTextModel(model);
                                    } else {
                                        setSelectedTextModel(undefined);
                                    }
                                }}>
                                    <SelectTrigger className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all text-sm">
                                        <SelectValue placeholder={selectedTextModel === undefined ? "Select Model": ""}/>
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/20">
                                        {textModels.map((model) => (
                                            <SelectItem
                                                key={model.id}
                                                value={model.id.toString()}
                                                className="text-white hover:bg-white/10 !hover:text-white cursor-pointer text-sm"
                                            >
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem
                                            value={"Select Model"}
                                            className="text-white place-content-end flex w-full hover:bg-white/10 !hover:text-white cursor-pointer text-sm"
                                        >
                                            Select Model
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                            </span>

                            {selectedTextModel && (
                                <div className="space-y-4 no-scrollbar mt-4">
                                    {/* Input Section */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-white text-sm">Input Prompt</label>
                                            <button
                                                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                                                onClick={() => setInputText(full_Prompt_To_Generate_Lotus_Article)}
                                            >
                                                Use Default
                                            </button>
                                        </div>

                                        <div className="bg-white/5 rounded-lg p-3 space-y-3">
                                            <textarea
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                className="w-full bg-slate-800 text-white rounded p-2 border border-white/20 text-sm"
                                                rows={3}
                                            />

                                            <div className="flex justify-between items-end text-xs text-slate-400">
                                                <div>
                                                    <span className="block">Words: {inputText.trim().split(/\s+/).filter(word => word.length > 0).length}</span>
                                                    <span>Characters: {inputText.trim().length}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-white text-xs">Cost Est.</span>
                                                    <span className="text-blue-400 text-2xl font-bold">${inputCost?.toFixed(6)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Output Section */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-white text-sm">Generated Article</label>
                                            <button
                                                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                                                onClick={() => setOutputText(defaultLotusArticle)}
                                            >
                                                Use Default
                                            </button>
                                        </div>

                                        <div className="bg-white/5 rounded-lg p-3 space-y-3">
                                            <textarea
                                                value={outputText}
                                                onChange={(e) => setOutputText(e.target.value)}
                                                className="w-full bg-slate-800 text-white rounded p-2 border border-white/20 text-sm"
                                                rows={3}
                                            />

                                            <div className="flex justify-between items-end text-xs text-slate-400">
                                                <div>
                                                    <span className="block">Words: {outputText.trim().split(/\s+/).filter(word => word.length > 0).length}</span>
                                                    <span>Characters: {outputText.trim().length}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-white text-xs">Cost Est.</span>
                                                    <span className="text-blue-400 text-2xl font-bold">${outputCost?.toFixed(6)}</span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Image Model Card */}
                        <div className="bg-white/10 h-full no-scrollbar flex flex-col gap-10 justify-between backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg">

                            <div className="">

                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-1">Image Model</h2>
                                        <p className="text-sm text-slate-400">Configure image generation settings</p>
                                    </div>
                                    <div className="flex items-center flex-col gap-2">
                                        {selectedImageModel && (
                                            <>
                                                <a target="_blank" href={selectedImageModel?.modelLink} className="">

                                                    <Image
                                                        src={selectedImageModel.modelImg}
                                                        alt=""
                                                        width={40}
                                                        height={40}
                                                        className="rounded-lg shadow-lg"
                                                    />
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Select onValueChange={(value) => {
                                    const model = imageModels.find(m => m.id.toString() === value);
                                    if (model) {
                                        setSelectedImageModel(model);
                                    } else {
                                        setSelectedImageModel(undefined);
                                    }
                                }}>
                                    <SelectTrigger className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all text-sm">
                                        <SelectValue placeholder="Select Model" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/20">
                                        {imageModels.map((model) => (
                                            <SelectItem
                                                key={model.id}
                                                value={model.id.toString()}
                                                className="text-white hover:bg-white/10 cursor-pointer text-sm"
                                            >
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                            <SelectItem
                                            value={"Select Model"}
                                            className="text-white place-content-end flex w-full hover:bg-white/10 !hover:text-white cursor-pointer text-sm"
                                        >
                                            Select Model
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>

                            {selectedImageModel && (
                                <>

                                    <div className="w-full no-scrollbar flex flex-col items-center justify-center gap-3">
                                        <p className="text-white">Example Image</p>
                                        <div className="w-full flex justify-center">
                                            <AnimatedList delay={6180} className="overflow-hidden  !w-[300px] h-[300px]">

                                                {Array.from({ length: 10 }, () => selectedImageModel?.exampleImages ?? []).flat().map((image, index) => (<div key={index} className="p-2 relative h-[300px]">
                                                    <Image
                                                        src={image}
                                                        alt=""
                                                        width={500}
                                                        height={500}
                                                        objectFit="contain"
                                                        objectPosition="center"
                                                        className="rounded-lg h-[300px] absolute top-0 inset-0 m-auto aspect-square w-[300px] object-cover"
                                                    />
                                                </div>
                                                ))}
                                            </AnimatedList>
                                        </div>
                                    </div>

                                    <div className="h-max bg-white/5 mt-5  justify-between flex flex-col rounded-lg p-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white text-sm">Cost per Image</span>
                                            <span className="text-blue-400 text-2xl font-bold">${imageOutputCost?.toFixed(6)}</span>
                                        </div>
                                    </div>

                                </>
                            )}
                        </div>

                        {/* Audio Model Card */}
                        <div className="bg-white/10 flex flex-col justify-between backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg">

                            <div className="">

                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-1">Audio Model</h2>
                                        <p className="text-sm text-slate-400">Configure audio generation settings</p>
                                    </div>
                                    <div className="flex items-center flex-col gap-2">
                                        {selectedAudioModel && (
                                            <>
                                                <a target="_blank" href={selectedAudioModel?.modelLink} className="">

                                                    <Image
                                                        src={selectedAudioModel.modelImg}
                                                        alt=""
                                                        width={40}
                                                        height={40}
                                                        className="rounded-lg shadow-lg"
                                                    />
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Select onValueChange={(value) => {
                                    const model = audioModels.find(m => m.id.toString() === value);
                                    if (model) {
                                        setSelectedAudioModel(model); 
                                    } 
                                    else {
                                        setSelectedAudioModel(undefined);
                                    }
                                }}>
                                    <SelectTrigger className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all text-sm">
                                        <SelectValue placeholder="Select Model" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/20">
                                        {audioModels.map((model) => (
                                            <SelectItem
                                                key={model.id}
                                                value={model.id.toString()}
                                                className="text-white hover:bg-white/10 cursor-pointer text-sm"
                                            >
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                                <SelectItem
                                            value={"Select Model"}
                                            className="text-white place-content-end flex w-full hover:bg-white/10 !hover:text-white cursor-pointer text-sm"
                                        >
                                            Select Model
                                        </SelectItem> 
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedAudioModel && (


                                <>
                                    <div className="w-full no-scrollbar h-max my-5  place-items-center gap-3 flex flex-col">
                                        <p className="text-white">Example Audio</p>
                                        <div className="w-[60%] h-[60%]  place-self-center">
                                            <audio
                                                src={selectedAudioModel?.exampleAudio}
                                                controls
                                                className="rounded-lg aspect-square w-full object-cover"
                                            />
                                        </div>
                                        <p className="text-white">Can It Clone Voices?:</p>
                                        <div style={{ backgroundColor: selectedAudioModel?.canCloneVoice === true ? "rgba(0, 128, 0, 0.5)" : "rgba(255, 0, 0, 0.5)" }} className="px-10 py-1 rounded">
                                            <p style={{ opacity: 1 }} className="text-white font-bold">{selectedAudioModel?.canCloneVoice === true ? 'Yes!' : "No"}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                {selectedAudioModel?.costPerSecond && (
                                                    <>
                                                        <span className="text-white text-sm">Average Article Length (seconds)</span>
                                                        <input
                                                            type="number"
                                                            value={averageArticleLength}
                                                            onChange={(e) => setAverageArticleLength(parseInt(e.target.value) || 0)}
                                                            className="w-20 bg-slate-800 text-white rounded p-1 border border-white/20 text-sm"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-white text-sm">Cost Est.</span>
                                                <span className="text-blue-400 text-2xl font-bold">${audioOutputCost?.toFixed(6)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Cost Summary Card */}
                        <div className="col-span-full no-scrollbar bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-white">Cost Analysis</h2>
                                <button
                                    onClick={() => {
                                        setSelectedTextModel(undefined);
                                        setSelectedImageModel(undefined);
                                        setSelectedAudioModel(undefined);
                                        setInputText("");
                                        setOutputText("");
                                        setAverageArticleLength(90);
                                        setCustomArticleCount(0);
                                    }}
                                    className="px-3 py-1 bg-gray-500 hover:bg-red-600 text-white rounded text-xs"
                                >
                                    Reset All
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <p className="text-slate-400 text-sm mb-1">Single Article</p>
                                    <p className="text-2xl font-bold text-white">${totalCost.toFixed(6)}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <p className="text-slate-400 text-sm mb-1">30 Articles</p>
                                    <p className="text-2xl font-bold text-white">${(totalCost * 30).toFixed(6)}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <span className="flex gap-2 place-items-end">
                                                <input
                                                    type="text"
                                                    value={customArticleCount}
                                                    onChange={(e) => {
                                                        if (Number(e.target.value) > -1) {
                                                          handleCustomArticleCountChange(e);
                                                        } else {
                                                          console.log("Negative number");
                                                        }
                                                      }}                                                    className="w-20 bg-slate-800 text-white rounded p-1 border border-white/20 outline-none text-sm"
                                                    placeholder="Count"
                                                />
                                                <p className="text-slate-400 text-sm mb-1">Count</p>
                                            </span>
                                            <p className="text-2xl font-bold text-white">${customCost.toFixed(6)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Enhanced login view
    return (
        <div className="min-h-screen no-scrollbar flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="max-w-md no-scrollbar w-full p-8">
                <div className="bg-white/10 no-scrollbar backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
                    <h1 className="text-3xl no-scrollbar font-bold text-white text-center mb-8">Admin Access</h1>
                    <input
                        type="password"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        className="w-full bg-white/5 text-white rounded-lg p-4 border border-white/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter password"
                    />
                </div>
            </div>
        </div>
    )
}
