
// SECTION -----------------------


        export interface TextModel {
            id: number;
            type: string;
            source: string;
            name: string;
            modelImg: string;
            modelLink: string;
            description: string;
            inputTokenCostPerMillion: number;
            outputCostsPerMillion: number;
            estimateInputTokens: (text: string) => number;
            estimateOutputTokens: (text: string) => number;
        }

        export const uTIL_META_8B_INSTRUCT_GENERATION_COST = 0.000012

        export const unsortedTextModels: TextModel[] = [
            {
                id: 4,
                type: "text",
                source: "replicate.com",
                name: 'meta/meta-llama-3-8b-instruct',
                description: "An 8 billion parameter language model from Meta, fine tuned for chat completions",
                modelImg: "https://github.com/facebookresearch.png",
                modelLink: "https://replicate.com/meta/meta-llama-3-8b-instruct",
                inputTokenCostPerMillion: 0.05,
                outputCostsPerMillion: 0.25,
                estimateInputTokens: (text: string): number => {
                    const TOKENS_PER_DOLLAR = 20_000_000;
                    const estimatedTokens = Math.ceil(text.length * 0.75); 
                    return (estimatedTokens / TOKENS_PER_DOLLAR) * 1_000_000; // Convert to cost per million tokens
                },
                estimateOutputTokens: (text: string): number => {
                    const TOKENS_PER_DOLLAR = 4_000_000;
                    const estimatedTokens = Math.ceil(text.length * 0.75);
                    return (estimatedTokens / TOKENS_PER_DOLLAR) * 1_000_000; // Convert to cost per million tokens
                }
            },   
            {
                id: 3,
                type: "text",
                source: "replicate.com",
                name: 'meta/meta-llama-3-70b-instruct',
                description: "A 70 billion parameter language model from Meta, fine tuned for chat completions",
                modelImg: "https://github.com/facebookresearch.png",
                modelLink: "https://replicate.com/meta/meta-llama-3-70b-instruct",
                inputTokenCostPerMillion: 0.65,
                outputCostsPerMillion: 2.75,
                estimateInputTokens: (text: string): number => {
                    const TOKENS_PER_DOLLAR = 1_500_000;
                    const estimatedTokens = Math.ceil(text.length * 0.75); 
                    return (estimatedTokens / TOKENS_PER_DOLLAR) * 1_000_000; // Convert to cost per million tokens
                },
                estimateOutputTokens: (text: string): number => {
                    const TOKENS_PER_DOLLAR = 360_000;
                    const estimatedTokens = Math.ceil(text.length * 0.75); 
                    return (estimatedTokens / TOKENS_PER_DOLLAR) * 1_000_000; // Convert to cost per million tokens
                }
            },   
            {
                id: 1,
                type: "text",
                source: "replicate.com",
                name: 'anthropic/claude-3.5-haiku',
                description: "Anthropic's fastest, most cost-effective model, with a 200K token context window (claude-3-5-haiku-20241022)",
                modelImg: "https://tjzk.replicate.delivery/models_organizations_avatar/3ae166e2-eacf-40c2-8481-a44db39695fe/76263028.png",
                modelLink: "https://replicate.com/anthropic/claude-3.5-haiku",
                inputTokenCostPerMillion: 1,
                outputCostsPerMillion: 5,
                estimateInputTokens: (text: string): number => {
                    const TOKENS_PER_DOLLAR = 1_000_000;
                    const estimatedTokens = Math.ceil(text.length * 0.75); 
                    return (estimatedTokens / TOKENS_PER_DOLLAR) * 1_000_000; // Convert to cost per million tokens
                },
                estimateOutputTokens: (text: string): number => {
                    const TOKENS_PER_DOLLAR = 200_000;
                    const estimatedTokens = Math.ceil(text.length * 0.75); 
                    return (estimatedTokens / TOKENS_PER_DOLLAR) * 1_000_000; // Convert to cost per million tokens
                }
            },   
            {
                id: 8,
                type: "text",
                source: "replicate.com",
                name: 'anthropic/claude-3.5-sonnet',
                description: "Anthropic's most intelligent language model to date, with a 200K token context window and image understanding (claude-3-5-sonnet-20241022)",
                modelImg: "https://tjzk.replicate.delivery/models_organizations_avatar/3ae166e2-eacf-40c2-8481-a44db39695fe/76263028.png",
                modelLink: "https://replicate.com/anthropic/claude-3.5-sonnet",
                inputTokenCostPerMillion: 3.75,
                outputCostsPerMillion: 18.75,
                estimateInputTokens: (text: string): number => {
                    const TOKENS_PER_DOLLAR = 260_000;
                    const estimatedTokens = Math.ceil(text.length * 0.75); 
                    return (estimatedTokens / TOKENS_PER_DOLLAR) * 1_000_000; // Convert to cost per million tokens
                },
                estimateOutputTokens: (text: string): number => {
                    const TOKENS_PER_DOLLAR = 53_000;
                    const estimatedTokens = Math.ceil(text.length * 0.75); 
                    return (estimatedTokens / TOKENS_PER_DOLLAR) * 1_000_000; // Convert to cost per million tokens
                }
            },   
            {
                id: 2,
                type: "text",
                source: "replicate.com",
                name: 'deepseek-ai/deepseek-r1',
                description: "A reasoning model trained with reinforcement learning, on par with OpenAI o1",
                modelImg: "https://github.com/deepseek-ai.png",
                modelLink: "https://replicate.com/deepseek-ai/deepseek-r1",
                inputTokenCostPerMillion: 10,
                outputCostsPerMillion: 10,
                estimateInputTokens: (text: string): number => {
                    const TOKENS_PER_DOLLAR = 100000;
                    const estimatedTokens = Math.ceil(text.length * 0.75); 
                    return (estimatedTokens / TOKENS_PER_DOLLAR) * 1_000_000; // Convert to cost per million tokens
                },
                estimateOutputTokens: (text: string): number => {
                    const TOKENS_PER_DOLLAR = 100000;
                    const estimatedTokens = Math.ceil(text.length * 0.75); 
                    return (estimatedTokens / TOKENS_PER_DOLLAR) * 1_000_000; // Convert to cost per million tokens
                }
            },   
        ]

        export function estimateCostOfInput(text: string, model: string) {
            const modelData = textModels.find(m => m.name === model);
            if (!modelData) {
                console.log(`Model ${model} not found`);
                return
            }

            const tokens = modelData.estimateInputTokens(text);
            return (tokens * modelData.inputTokenCostPerMillion) / 1_000_000;
        }

        export function estimateCostOfOutput(text: string, model: string) {
            const modelData = textModels.find(m => m.name === model);
            if (!modelData) {
                console.log(`Model ${model} not found`);
                return
            }

            const tokens = modelData.estimateOutputTokens(text);
            return ((tokens * modelData.outputCostsPerMillion) / 1_000_000) + uTIL_META_8B_INSTRUCT_GENERATION_COST;
        }

        export const sortTextModelsByCost = (models: TextModel[]) => {
            return models.sort((a, b) => {
                const aCost = a.inputTokenCostPerMillion + a.outputCostsPerMillion;
                const bCost = b.inputTokenCostPerMillion + b.outputCostsPerMillion;
                return aCost - bCost;
            });
        }
    
        export const textModels: TextModel[] = sortTextModelsByCost(unsortedTextModels);    


// SECTION -----------------------


        export interface ImageModel {
            id: number;
            type: string;
            source: string;
            name: string;
            modelImg: string;
            modelLink: string;
            description: string;
            costPerImage: number;
            exampleImages: string[];
        }


        export const unsortedImageModels: ImageModel[] = [

            {
                id: 10,
                type: "image",
                source: "replicate.com",
                name: 'imagen-3-fas',
                description: "Google's highest quality text-to-image model, capable of generating images with detail, rich lighting and beauty",
                modelImg: "https://tjzk.replicate.delivery/models_organizations_avatar/27e1e3fe-f766-4748-83b3-777bc282d8dd/1342004.png",
                modelLink: "https://replicate.com/google/imagen-3",
                costPerImage: 0.05,
                exampleImages: [
                    "https://replicate.delivery/xezq/YlV5edh3Zl1uJSJpfmGor4mjZ90MonHGhOiieiS3t9g04vYoA/tmp_aldsebi.png",
                    "https://replicate.delivery/xezq/iwN5atioJTYgGVzVonhdDfbQZznTSBFTqmfh5WY84gP05XMUA/tmp7k57elxf.png",
                    "https://replicate.delivery/xezq/b5fXAtNpDG2VGKw0PS5sZQnBPUELYSW8UCTE2hY6FMbO9LGKA/tmpjy2usxb6.png",
                    "https://replicate.delivery/xezq/ljGRaNwW4ArNINDeEAhCtBc2e3DiEDA8Z9OdQMMKmvjf1vYoA/tmpc3m6bs0j.png",
                    "https://replicate.delivery/xezq/Acmgbf5pOYWYCaBzuBffTG5caZerKOjVen3eLXlD3fLP19LGKA/tmp67ewhp38.png",
                ],
            },
            {
                id: 2,
                type: "image",
                source: "replicate.com",
                name: 'imagen-3-fast',
                description: "A faster and cheaper Imagen 3 model, for when price or speed are more important than final image quality",
                modelImg: "https://tjzk.replicate.delivery/models_organizations_avatar/27e1e3fe-f766-4748-83b3-777bc282d8dd/1342004.png",
                modelLink: "https://replicate.com/google/imagen-3-fast",
                costPerImage: 0.025,
                exampleImages: [
                    "https://replicate.delivery/xezq/BsWBsl2clpLSGJLy4m4Gyce5cXU1aSO22xbmq4sWcf6k5kMUA/tmpuxt6kt2a.png",
                    "https://replicate.delivery/xezq/6FnmgUVDjAYVGZRU2ntxcCb8a2Z3LgDE4jLiVPajFKo1NJDF/tmpz0pgg0ch.png",
                ],
            },
            {
                id: 893,
                type: "image",
                source: "replicate.com",
                name: 'black-forest-labs/flux-1.1-pro',
                description: "Faster, better FLUX Pro. Text-to-image model with excellent image quality, prompt adherence, and output diversity.",
                modelImg: "https://tjzk.replicate.delivery/models_organizations_avatar/01ed70be-0d47-4a4a-85fb-32c02cdd4ab5/bfl.png",
                modelLink: "https://replicate.com/black-forest-labs/flux-1.1-pro",
                costPerImage: 0.04,
                exampleImages: [
                    "https://replicate.delivery/czjl/jf91x1a9ZJRYY6u6E83jNUq7CMHR7lEVFOiJ3BdfmwxyYeKnA/output.webp",
                    "https://replicate.delivery/czjl/HQZ89fz0ogUSJi2RLpuTyYERDsOKRsbNNJwLMOHdGIEAMvyJA/output.webp",
                    "https://replicate.delivery/czjl/XetPfMnnBtnyLUNiNcnl2Hneyeo8AsfsOl2AG5Znql5f3VK9E/tmpuv7lgrx7.jpg",
                ],
            },
            {
                id: 98,
                type: "image",
                source: "replicate.com",
                name: 'black-forest-labs/flux-1.1-pro-ultra',
                description: "FLUX1.1 [pro] in ultra and raw modes. Images are up to 4 megapixels. Use raw mode for realism.",
                modelImg: "https://tjzk.replicate.delivery/models_organizations_avatar/01ed70be-0d47-4a4a-85fb-32c02cdd4ab5/bfl.png",
                modelLink: "https://replicate.com/black-forest-labs/flux-1.1-pro-ultra",
                costPerImage: 0.06,
                exampleImages: [
                    "https://replicate.delivery/czjl/r9f00cZeo4inIECF8vfKO4p9Zif2faRqOtGxfqaIwaDRq3l7E/output.jpg",
                    "https://replicate.delivery/czjl/EHFL8RPvuJorGRnnqcS8ioTBDWCBKgZxYNlNG4BneGg9vL3JA/output.jpg",
                    "https://replicate.delivery/czjl/seflbeMQxIJB9JlQ2tZbdYyClKv5OBsoeK4ct8RODQ3qLeydC/output.jpg",
                    "https://replicate.delivery/czjl/MAmPIV8yJ864Lx0lGHkApfxoxfI8mzl1nUaoFfAsSVdTHvcnA/output.jpg",
                ],
            },
            {
                id: 48811902,
                type: "image",
                source: "replicate.com",
                name: 'black-forest-labs/flux-schnell',
                description: "The fastest image generation model tailored for local development and personal use",
                modelImg: "https://tjzk.replicate.delivery/models_organizations_avatar/01ed70be-0d47-4a4a-85fb-32c02cdd4ab5/bfl.png",
                modelLink: "https://replicate.com/black-forest-labs/flux-schnell",
                costPerImage: 0.003,
                exampleImages: [
                    "https://replicate.delivery/yhqm/hcDDSNf633zeDUz9sWkKfaftcfJLWIvuhn9vfCFWmufxelmemA/out-0.webp",
                    "https://replicate.delivery/yhqm/QeGlhr8w4CWefov8rFAozycqveU4anxkYuUVxANfolFP710bC/out-0.webp",
                    "https://replicate.delivery/yhqm/pNZ3A6l9B35dB9VxE0eGqkGfBGe401MjUttdOyzvpfWbEb6NB/out-0.webp",
                    "https://replicate.delivery/yhqm/74gHlK2Mrc7YL5dnnjopehWLftlfSA8449R6lECKI4OhjN9mA/out-0.webp",
                ],
            },
            {
                id: 76420,
                type: "image",
                source: "replicate.com",
                name: 'stability-ai/stable-diffusion-3.5-large',
                description: "A text-to-image model that generates high-resolution images with fine details. It supports various artistic styles and produces diverse outputs from the same prompt, thanks to Query-Key Normalization.",
                modelImg: "https://github.com/stability-ai.png",
                modelLink: "stability-ai/stable-diffusion-3.5-large",
                costPerImage: 0.065,
                exampleImages: [
                    "https://replicate.delivery/yhqm/x5swvMgXyDr5JxhAqWf7Sty3YdzweRHHgG6EZA5ndfN0WwSnA/R8_sd3.5L_00001_.webp",
                    "https://replicate.delivery/yhqm/6ctUeWKkzZXxTy1CHx7R94ysbwB4nrpiyM3pLVvODsq70q0JA/R8_sd3.5L_00001_.webp",
                    "https://replicate.delivery/yhqm/QJWJKJxtF6aSAljJuAF6t1Qbf2hmxkPtKzNzd36xPGR51q0JA/R8_sd3.5L_00001_.webp",
                    "https://replicate.delivery/yhqm/mxMdiQ52lxLCGBbuyW6YHpg1k47JVXuRgEOeTFgfAYfubrSnA/R8_sd3.5L_00001_.webp",
                    "https://replicate.delivery/yhqm/PMawGj2JwA58MpmZKkCNE4adlQfMLRJ0wZG6VH5JtY648q0JA/R8_sd3.5L_00001_.webp",
                ],
            },
            {
                id: 421,
                type: "image",
                source: "replicate.com",
                name: 'luma/photon-flash',
                description: "Accelerated variant of Photon prioritizing speed while maintaining quality.",
                modelImg: "https://github.com/lumalabs.png",
                modelLink: "https://replicate.com/luma/photon-flash",
                costPerImage: 0.01,
                exampleImages: [
                    "https://replicate.delivery/czjl/6iZ89qakg74mCVjFYeDk0GljoYQReoV0k7WwSjxXmCLcV53TA/tmpyf9dx02r.jpg",
                    "https://replicate.delivery/czjl/S24pE27fMHSgMiRdR9XjOSfMSQsY3PU7V7iinVJRpK1QIS4TA/tmp6rot2esk.jpg",
                    "https://replicate.delivery/czjl/uWFbIOpCY86lK1wDwDQu4QU3cKeUKuNJ40Wbaj6e4VFWJS4TA/tmp74wk9ei8.jpg",
                    "https://replicate.delivery/czjl/2rhdfmpF8kUdM6BMi0pQ9tWSjeLsHFebVPChUOAuneAHwIhPB/tmprzzgez7v.jpg",
                ],
            },
            {
                id: 420,
                type: "image",
                source: "replicate.com",
                name: 'luma/photon',
                description: "High-quality image generation model optimized for creative professional workflows and ultra-high fidelity outputs",
                modelImg: "https://github.com/lumalabs.png",
                modelLink: "https://replicate.com/luma/photon",
                costPerImage: 0.03,
                exampleImages: [
                    "https://replicate.delivery/czjl/bN35SK7p4yqNAxfG9Tgak5YuyfvTcGiAbqPltpbKEc0VRfJoA/tmp95lh8mhu.jpg",
                    "https://replicate.delivery/czjl/pljy4sXHXaKFKhxWHmHwk7NeZcfOyK1EttmUnvusfQMLleTQB/tmpq7sln2d8.jpg",
                    "https://replicate.delivery/czjl/8OCeQ2BMrHRGSCGucfqTMkSqWTbbJx16aqfaFhUjTQRineTQB/tmpzoq23_47.jpg",
                    "https://replicate.delivery/czjl/oPGWrkS4r15RBVAGTGPWWP7fn9vDaEXxkuO8udfNf12wneTQB/tmp5f41ihmo.jpg",
                    "https://replicate.delivery/czjl/Fc4EeOoLqoUf8kyhODIVDlXecfesT4DH4xZd3T5NMiNWY5ngC/tmpchxmiryq.jpg",
                    "https://replicate.delivery/czjl/e22RjMHkpyTqAK1lOMBOiA7qk8EzVUqdsOnwZ3WyYRfnQfJoA/tmpikiabvls.jpg",
                ],
            },  
            {
                id: 43316752,
                type: "image",
                source: "replicate.com",
                name: 'stability-ai/stable-diffusion-3.5-medium',
                description: "2.5 billion parameter image model with improved MMDiT-X architecture",
                modelImg: "https://github.com/stability-ai.png",
                modelLink: "https://replicate.com/stability-ai/stable-diffusion-3.5-medium",
                costPerImage: 0.035,
                exampleImages: [
                    "https://replicate.delivery/yhqm/K6hD2bwf4SyQWaDJ1vP8854v2xG4ihlQBLu2zfQZTj95XprTA/R8_sd3.5L_00001_.webp",
                    "https://replicate.delivery/yhqm/b8ZWW3KneUSuca1q7wzUrSpRsElbIdLtFqXEMaZetgrLaprTA/R8_sd3.5L_00001_.webp",
                    "https://replicate.delivery/yhqm/fa78p5ERflveDIl2hXnB8TRgjbozUcX2BeEWDL7lUSGiyluOB/R8_sd3.5L_00001_.webp",
                ],
            },

        ]

        const sortImageModelsByCost = (models: ImageModel[]) => {
            return models.sort((a, b) => a.costPerImage - b.costPerImage);
        };

        export const imageModels: ImageModel[] = sortImageModelsByCost(unsortedImageModels);


// SECTION -----------------------


        export interface AudioModel {
            id: number;
            type: string;
            source: string;
            name: string;
            description: string;
            modelImg: string;
            modelLink: string;
            costPerGeneration?: number;
            costPerSecond?: number;
            canCloneVoice: boolean;
            exampleAudio: string;
        }

        export interface AudioSource {
            modelName: string;
            file: string;
        }

        const audioSources: AudioSource[] = [
            {
                modelName: 'kokoro-82m',
                file: "/kokoro.mp3",  // Use a relative URL
            },
            {
                modelName: 'f5-tts',
                file: "/f5-tts.mp3",
            },
            {
            modelName: "voicecraft",
            file: "/voicecraft.mp3",  
            },
            {
                modelName: 'xtts-v2',
                file: "/xtts-v2.mp3",
            },
            {
                modelName: "play-dialog",
                file: "/play-dialog.mp3",
            },
            {
                modelName: "tortoise-tts",
                file: "/tortoise-tts.mp3",
            },
            {
                modelName: "parler-tts",
                file: "/parler-tts.mp3",
            },
            {
                modelName: "zonos",
                file: "/zonos.mp3",
            },
            // {
            //     modelName: "",
            //     file: "/",
            // },
        ];

        export const unsortedAudioModels: AudioModel[] = [
            {
                id: 1890,
                type: "audio",
                source: "replicate.com",
                name: 'kokoro-82m',
                description: "A model by jaaari",
                modelImg: "https://github.com/jaaari.png",
                modelLink: "https://replicate.com/jaaari/kokoro-82m",
                costPerGeneration: 0.00022,
                canCloneVoice: false,
                exampleAudio: audioSources.find(a => a.modelName === 'kokoro-82m')?.file || '',
            },
            // {
            //     id: 2,
            //     type: "audio",
            //     source: "replicate.com",
            //     name: 'f5-tts',
            //     description: "A model by nyxynyx",
            //     modelImg: "https://tjzk.replicate.delivery/models_organizations_avatar/1b238c43-3c32-441a-9d71-e25a7946d01c/Sjtu-logo-standard-red.png",
            //     modelLink: "https://replicate.com/x-lance/f5-tts",
            //     costPerGeneration: 0.12,
            //     canCloneVoice: true,
            //     exampleAudio: audioSources.find(a => a.modelName === 'f5-tts')?.file || '',
            // },
            // {
            //     id: 4,
            //     type: "audio",
            //     source: "replicate.com",
            //     name: 'xtts-v2',
            //     description: "A model by lucataco",
            //     modelImg: "https://github.com/lucataco.png",
            //     modelLink: "https://replicate.com/lucataco/xtts-v2",
            //     costPerGeneration: 0.012,
            //     canCloneVoice: true,
            //     exampleAudio: audioSources.find(a => a.modelName === 'xtts-v2')?.file || '',
            // },
            // {
            //     id: 6,
            //     type: "audio",
            //     source: "replicate.com",
            //     name: 'tortoise-tts',
            //     description: "A model by afiaka87",
            //     modelImg: "https://github.com/afiaka87.png",
            //     modelLink: "https://replicate.com/afiaka87/tortoise-tts",
            //     costPerGeneration: 0.087 ,
            //     canCloneVoice: true,
            //     exampleAudio: audioSources.find(a => a.modelName === 'tortoise-tts')?.file || '',
            // },
            // {
            //     id: 9,
            //     type: "audio",
            //     source: "replicate.com",
            //     name: 'zonos',
            //     description: "A model by jaaari",
            //     modelImg: "https://github.com/jaaari.png",
            //     modelLink: "https://replicate.com/jaaari/zonos",
            //     costPerGeneration: 0.018,
            //     canCloneVoice: true,
            //     exampleAudio: audioSources.find(a => a.modelName === '')?.file || '',
            // },
        ]

        export function estimateCostOfAudioResponse(costPerGeneration: any, costPerSecond: any, avgArticleLength: any, model: string): any {
            // Use the passed parameters directly since they're already extracted from the model
            if (costPerSecond !== undefined && avgArticleLength !== undefined) {
                const totalCost = costPerSecond * avgArticleLength;
                console.log("USING COST PER SECOND", totalCost);
                return totalCost;
            } else if (costPerGeneration !== undefined) {
                console.log("USING COST PER GENERATION", costPerGeneration);
                return costPerGeneration;
            }

            console.log(`No valid cost calculation method available for model ${model}`);
            return undefined;
        }

        export const sortAudioModelsByCost = (models: AudioModel[]) => {
            return models.sort((a, b) => {
                if (a.costPerGeneration !== undefined && b.costPerGeneration !== undefined) {
                    return a.costPerGeneration - b.costPerGeneration;
                } else if (a.costPerSecond !== undefined && b.costPerSecond !== undefined) {
                    return a.costPerSecond - b.costPerSecond;
                } else {
                    return 0;
                }
            });
        };

        export const audioModels: AudioModel[] = sortAudioModelsByCost(unsortedAudioModels);
