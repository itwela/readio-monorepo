
-------------------------------------
Translated Report (Full Report Below)
-------------------------------------

Incident Identifier: 5ECA4509-E9D4-4676-917B-D49A9C785F0A
CrashReporter Key:   5EEA956B-8221-9568-DF77-517E5D20BA33
Hardware Model:      Mac15,12
Process:             Lotus [6486]
Path:                /Users/USER/Library/Developer/CoreSimulator/Devices/0C188186-714A-4AA9-808D-4DD1DF6A0332/data/Containers/Bundle/Application/B370FF5D-CC19-4CC2-B93A-A10EB4DE158C/Lotus.app/Lotus
Identifier:          com.readionetwork.readio
Version:             1.0.0 (1)
Code Type:           ARM-64 (Native)
Role:                Foreground
Parent Process:      launchd_sim [97126]
Coalition:           com.apple.CoreSimulator.SimDevice.0C188186-714A-4AA9-808D-4DD1DF6A0332 [147005]
Responsible Process: SimulatorTrampoline [765]

Date/Time:           2025-05-19 16:03:32.0309 -0400
Launch Time:         2025-05-19 16:00:12.9312 -0400
OS Version:          macOS 14.6 (23G80)
Release Type:        User
Report Version:      104

Exception Type:  EXC_CRASH (SIGABRT)
Exception Codes: 0x0000000000000000, 0x0000000000000000
Termination Reason: SIGNAL 6 Abort trap: 6
Terminating Process: Lotus [6486]

Triggered by Thread:  26

Kernel Triage:
VM - (arg = 0x3) mach_vm_allocate_kernel failed within call to vm_map_enter
VM - (arg = 0x3) mach_vm_allocate_kernel failed within call to vm_map_enter
VM - (arg = 0x3) mach_vm_allocate_kernel failed within call to vm_map_enter


Thread 0::  Dispatch queue: com.apple.main-thread
0   libsystem_kernel.dylib        	       0x104ad1170 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x104ae2660 mach_msg2_internal + 76
2   libsystem_kernel.dylib        	       0x104ad9318 mach_msg_overwrite + 532
3   libsystem_kernel.dylib        	       0x104ad14e8 mach_msg + 20
4   CoreFoundation                	       0x18041ab60 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180415224 __CFRunLoopRun + 1160
6   CoreFoundation                	       0x180414960 CFRunLoopRunSpecific + 536
7   GraphicsServices              	       0x190183b10 GSEventRunModal + 160
8   UIKitCore                     	       0x185aa2b40 -[UIApplication _run] + 796
9   UIKitCore                     	       0x185aa6d38 UIApplicationMain + 124
10  Lotus.debug.dylib             	       0x10af09108 __debug_main_executable_dylib_entry_point + 96 (main.m:7)
11  dyld_sim                      	       0x1051e1410 start_sim + 20
12  dyld                          	       0x104b5a154 start + 2476

Thread 1:: com.apple.uikit.eventfetch-thread
0   libsystem_kernel.dylib        	       0x104ad1170 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x104ae2660 mach_msg2_internal + 76
2   libsystem_kernel.dylib        	       0x104ad9318 mach_msg_overwrite + 532
3   libsystem_kernel.dylib        	       0x104ad14e8 mach_msg + 20
4   CoreFoundation                	       0x18041ab60 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180415224 __CFRunLoopRun + 1160
6   CoreFoundation                	       0x180414960 CFRunLoopRunSpecific + 536
7   Foundation                    	       0x180f2af24 -[NSRunLoop(NSRunLoop) runMode:beforeDate:] + 208
8   Foundation                    	       0x180f2b144 -[NSRunLoop(NSRunLoop) runUntilDate:] + 60
9   UIKitCore                     	       0x185b4ec88 -[UIEventFetcher threadMain] + 404
10  Foundation                    	       0x180f51d6c __NSThread__start__ + 720
11  libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
12  libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 2:: com.facebook.SocketRocket.NetworkThread
0   libsystem_kernel.dylib        	       0x104ad1170 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x104ae2660 mach_msg2_internal + 76
2   libsystem_kernel.dylib        	       0x104ad9318 mach_msg_overwrite + 532
3   libsystem_kernel.dylib        	       0x104ad14e8 mach_msg + 20
4   CoreFoundation                	       0x18041ab60 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180415224 __CFRunLoopRun + 1160
6   CoreFoundation                	       0x180414960 CFRunLoopRunSpecific + 536
7   Foundation                    	       0x180f2af24 -[NSRunLoop(NSRunLoop) runMode:beforeDate:] + 208
8   Lotus.debug.dylib             	       0x10ca24248 -[SRRunLoopThread main] + 260 (SRRunLoopThread.m:71)
9   Foundation                    	       0x180f51d6c __NSThread__start__ + 720
10  libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
11  libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 3:: com.apple.NSURLConnectionLoader
0   libsystem_kernel.dylib        	       0x104ad1170 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x104ae2660 mach_msg2_internal + 76
2   libsystem_kernel.dylib        	       0x104ad9318 mach_msg_overwrite + 532
3   libsystem_kernel.dylib        	       0x104ad14e8 mach_msg + 20
4   CoreFoundation                	       0x18041ab60 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180415224 __CFRunLoopRun + 1160
6   CoreFoundation                	       0x180414960 CFRunLoopRunSpecific + 536
7   CFNetwork                     	       0x1849b9510 +[__CFN_CoreSchedulingSetRunnable _run:] + 372
8   Foundation                    	       0x180f51d6c __NSThread__start__ + 720
9   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
10  libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 4:: com.apple.CFSocket.private
0   libsystem_kernel.dylib        	       0x104adb68c __select + 8
1   CoreFoundation                	       0x1804295a4 __CFSocketManager + 676
2   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
3   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 5:: com.apple.CFNetwork.CustomProtocols
0   libsystem_kernel.dylib        	       0x104ad1170 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x104ae2660 mach_msg2_internal + 76
2   libsystem_kernel.dylib        	       0x104ad9318 mach_msg_overwrite + 532
3   libsystem_kernel.dylib        	       0x104ad14e8 mach_msg + 20
4   CoreFoundation                	       0x18041ab60 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180415224 __CFRunLoopRun + 1160
6   CoreFoundation                	       0x180414960 CFRunLoopRunSpecific + 536
7   CFNetwork                     	       0x1849b9510 +[__CFN_CoreSchedulingSetRunnable _run:] + 372
8   Foundation                    	       0x180f51d6c __NSThread__start__ + 720
9   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
10  libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 6:: com.apple.CFStream.LegacyThread
0   libsystem_kernel.dylib        	       0x104ad1170 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x104ae2660 mach_msg2_internal + 76
2   libsystem_kernel.dylib        	       0x104ad9318 mach_msg_overwrite + 532
3   libsystem_kernel.dylib        	       0x104ad14e8 mach_msg + 20
4   CoreFoundation                	       0x18041ab60 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180415224 __CFRunLoopRun + 1160
6   CoreFoundation                	       0x180414960 CFRunLoopRunSpecific + 536
7   CoreFoundation                	       0x180438f28 _legacyStreamRunLoop_workThread + 260
8   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
9   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 7:: com.apple.coremedia.imagequeue.coreanimation.common
0   libsystem_kernel.dylib        	       0x104ad4670 __psynch_cvwait + 8
1   libsystem_pthread.dylib       	       0x1051039cc _pthread_cond_wait + 1216
2   CoreMedia                     	       0x18ad524b4 WaitOnConditionTimed + 72
3   CoreMedia                     	       0x18ad51c80 FigSemaphoreWaitRelative + 168
4   MediaToolbox                  	       0x18fe12ab8 piqca_SharedPollingThread + 216
5   CoreMedia                     	       0x18ad533c8 figThreadMain + 220
6   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
7   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 8:: com.apple.coremedia.videomediaconverter
0   libsystem_kernel.dylib        	       0x104ad4670 __psynch_cvwait + 8
1   libsystem_pthread.dylib       	       0x1051039cc _pthread_cond_wait + 1216
2   CoreMedia                     	       0x18ad52030 WaitOnCondition + 16
3   CoreMedia                     	       0x18ad51c78 FigSemaphoreWaitRelative + 160
4   MediaToolbox                  	       0x18fdf8784 activitySchedulerOnThread + 92
5   CoreMedia                     	       0x18ad533c8 figThreadMain + 220
6   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
7   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 9:: com.apple.coremedia.videomentor
0   libsystem_kernel.dylib        	       0x104ad4670 __psynch_cvwait + 8
1   libsystem_pthread.dylib       	       0x1051039cc _pthread_cond_wait + 1216
2   CoreMedia                     	       0x18ad52030 WaitOnCondition + 16
3   CoreMedia                     	       0x18ad51c78 FigSemaphoreWaitRelative + 160
4   MediaToolbox                  	       0x18fd3356c videoMentorThreadWaitForOutputQueueToDropBelowHighWater + 244
5   MediaToolbox                  	       0x18fd2eec8 videoMentorThreadGenerateAndEnqueueFrame + 80
6   MediaToolbox                  	       0x18fd2ac9c videoMentorThreadForwardPlayback + 7372
7   MediaToolbox                  	       0x18fd25fe4 videoMentorThread + 1536
8   CoreMedia                     	       0x18ad533c8 figThreadMain + 220
9   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
10  libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 10:: com.apple.coremedia.JVTlib
0   libsystem_kernel.dylib        	       0x104ad10ec semaphore_wait_trap + 8
1   libdispatch.dylib             	       0x180179298 _dispatch_sema4_wait + 24
2   libdispatch.dylib             	       0x18017990c _dispatch_semaphore_wait_slow + 128
3   H264SW.videocodec             	       0x243c46604 0x243aec000 + 1418756
4   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
5   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 11:: com.apple.coremedia.JVTlib
0   libsystem_kernel.dylib        	       0x104ad10ec semaphore_wait_trap + 8
1   libdispatch.dylib             	       0x180179298 _dispatch_sema4_wait + 24
2   libdispatch.dylib             	       0x18017990c _dispatch_semaphore_wait_slow + 128
3   H264SW.videocodec             	       0x243c46604 0x243aec000 + 1418756
4   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
5   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 12:: com.apple.coremedia.JVTlib
0   libsystem_kernel.dylib        	       0x104ad10ec semaphore_wait_trap + 8
1   libdispatch.dylib             	       0x180179298 _dispatch_sema4_wait + 24
2   libdispatch.dylib             	       0x18017990c _dispatch_semaphore_wait_slow + 128
3   H264SW.videocodec             	       0x243c46604 0x243aec000 + 1418756
4   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
5   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 13:: com.apple.CoreMotion.MotionThread
0   libsystem_kernel.dylib        	       0x104ad1170 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x104ae2660 mach_msg2_internal + 76
2   libsystem_kernel.dylib        	       0x104ad9318 mach_msg_overwrite + 532
3   libsystem_kernel.dylib        	       0x104ad14e8 mach_msg + 20
4   CoreFoundation                	       0x18041ab60 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180415224 __CFRunLoopRun + 1160
6   CoreFoundation                	       0x180414960 CFRunLoopRunSpecific + 536
7   CoreFoundation                	       0x180415850 CFRunLoopRun + 60
8   CoreMotion                    	       0x193c42ef8 0x193a7a000 + 1871608
9   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
10  libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 14:
0   libsystem_pthread.dylib       	       0x1050fe5cc start_wqthread + 0

Thread 15:
0   libsystem_pthread.dylib       	       0x1050fe5cc start_wqthread + 0

Thread 16:
0   libsystem_pthread.dylib       	       0x1050fe5cc start_wqthread + 0

Thread 17:
0   libsystem_pthread.dylib       	       0x1050fe5cc start_wqthread + 0

Thread 18:
0   libsystem_pthread.dylib       	       0x1050fe5cc start_wqthread + 0

Thread 19:: com.facebook.react.JavaScript
0   libsystem_kernel.dylib        	       0x104ad1170 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x104ae2660 mach_msg2_internal + 76
2   libsystem_kernel.dylib        	       0x104ad9318 mach_msg_overwrite + 532
3   libsystem_kernel.dylib        	       0x104ad14e8 mach_msg + 20
4   CoreFoundation                	       0x18041ab60 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180415224 __CFRunLoopRun + 1160
6   CoreFoundation                	       0x180414960 CFRunLoopRunSpecific + 536
7   Lotus.debug.dylib             	       0x10b56e0d0 +[RCTCxxBridge runRunLoop] + 736 (RCTCxxBridge.mm:350)
8   Foundation                    	       0x180f51d6c __NSThread__start__ + 720
9   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
10  libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 20:: hades
0   libsystem_kernel.dylib        	       0x104ad4670 __psynch_cvwait + 8
1   libsystem_pthread.dylib       	       0x1051039cc _pthread_cond_wait + 1216
2   libc++.1.dylib                	       0x18030329c std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&) + 24
3   hermes                        	       0x105ea31a0 hermes::vm::HadesGC::Executor::worker() + 112
4   hermes                        	       0x105ea3104 void* std::__1::__thread_proxy[abi:v160006]<std::__1::tuple<std::__1::unique_ptr<std::__1::__thread_struct, std::__1::default_delete<std::__1::__thread_struct>>, hermes::vm::HadesGC::Executor::Executor()::'lambda'()>>(void*) + 44
5   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
6   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 21:: com.facebook.react.JavaScript
0   libsystem_kernel.dylib        	       0x104ad1170 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x104ae2660 mach_msg2_internal + 76
2   libsystem_kernel.dylib        	       0x104ad9318 mach_msg_overwrite + 532
3   libsystem_kernel.dylib        	       0x104ad14e8 mach_msg + 20
4   CoreFoundation                	       0x18041ab60 __CFRunLoopServiceMachPort + 156
5   CoreFoundation                	       0x180415224 __CFRunLoopRun + 1160
6   CoreFoundation                	       0x180414960 CFRunLoopRunSpecific + 536
7   Lotus.debug.dylib             	       0x10b56e0d0 +[RCTCxxBridge runRunLoop] + 736 (RCTCxxBridge.mm:350)
8   Foundation                    	       0x180f51d6c __NSThread__start__ + 720
9   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
10  libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 22:: hades
0   libsystem_kernel.dylib        	       0x104ad4670 __psynch_cvwait + 8
1   libsystem_pthread.dylib       	       0x1051039cc _pthread_cond_wait + 1216
2   libc++.1.dylib                	       0x18030329c std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&) + 24
3   hermes                        	       0x105ea31a0 hermes::vm::HadesGC::Executor::worker() + 112
4   hermes                        	       0x105ea3104 void* std::__1::__thread_proxy[abi:v160006]<std::__1::tuple<std::__1::unique_ptr<std::__1::__thread_struct, std::__1::default_delete<std::__1::__thread_struct>>, hermes::vm::HadesGC::Executor::Executor()::'lambda'()>>(void*) + 44
5   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
6   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 23:
0   libsystem_pthread.dylib       	       0x1050fe5cc start_wqthread + 0

Thread 24:
0   libsystem_pthread.dylib       	       0x1050fe5cc start_wqthread + 0

Thread 25:: hades
0   libsystem_kernel.dylib        	       0x104ad4670 __psynch_cvwait + 8
1   libsystem_pthread.dylib       	       0x1051039cc _pthread_cond_wait + 1216
2   libc++.1.dylib                	       0x18030329c std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&) + 24
3   hermes                        	       0x105ea31a0 hermes::vm::HadesGC::Executor::worker() + 112
4   hermes                        	       0x105ea3104 void* std::__1::__thread_proxy[abi:v160006]<std::__1::tuple<std::__1::unique_ptr<std::__1::__thread_struct, std::__1::default_delete<std::__1::__thread_struct>>, hermes::vm::HadesGC::Executor::Executor()::'lambda'()>>(void*) + 44
5   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
6   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 26 Crashed::  Dispatch queue: com.facebook.react.TrackPlayerModuleQueue
0   libsystem_kernel.dylib        	       0x104ad8f30 __pthread_kill + 8
1   libsystem_pthread.dylib       	       0x105103124 pthread_kill + 256
2   libsystem_c.dylib             	       0x18016c4ec abort + 104
3   libswiftCore.dylib            	       0x194a2d9ac swift::fatalErrorv(unsigned int, char const*, char*) + 132
4   libswiftCore.dylib            	       0x194a2d9c8 swift::fatalError(unsigned int, char const*, ...) + 28
5   libswiftCore.dylib            	       0x194a23df0 swift::swift_dynamicCastFailure(void const*, char const*, void const*, char const*, char const*) + 76
6   libswiftCore.dylib            	       0x194a23e68 swift::swift_dynamicCastFailure(swift::TargetMetadata<swift::InProcess> const*, swift::TargetMetadata<swift::InProcess> const*, char const*) + 120
7   libswiftCore.dylib            	       0x194a285c0 swift_dynamicCast + 280
8   Lotus.debug.dylib             	       0x10cb54fb4 MediaURL.init(object:) + 644 (MediaURL.swift:32)
9   Lotus.debug.dylib             	       0x10cb731f8 Track.init(dictionary:) + 664 (Track.swift:36)
10  Lotus.debug.dylib             	       0x10cb72f50 Track.__allocating_init(dictionary:) + 56
11  Lotus.debug.dylib             	       0x10cb68650 RNTrackPlayer.setQueue(trackDicts:resolve:reject:) + 320 (RNTrackPlayer.swift:661)
12  Lotus.debug.dylib             	       0x10cb68afc @objc RNTrackPlayer.setQueue(trackDicts:resolve:reject:) + 152
13  CoreFoundation                	       0x1804bdcc0 __invoking___ + 144
14  CoreFoundation                	       0x1804bac34 -[NSInvocation invoke] + 276
15  CoreFoundation                	       0x1804baecc -[NSInvocation invokeWithTarget:] + 60
16  Lotus.debug.dylib             	       0x10b5db8c0 -[RCTModuleMethod invokeWithBridge:module:arguments:] + 1892 (RCTModuleMethod.mm:584)
17  Lotus.debug.dylib             	       0x10b5dfbd4 facebook::react::invokeInner(RCTBridge*, RCTModuleData*, unsigned int, folly::dynamic const&, int, (anonymous namespace)::SchedulingContext) + 1848 (RCTNativeModule.mm:196)
18  Lotus.debug.dylib             	       0x10b5df2a8 facebook::react::RCTNativeModule::invoke(unsigned int, folly::dynamic&&, int)::$_0::operator()() const + 136 (RCTNativeModule.mm:113)
19  Lotus.debug.dylib             	       0x10b5df214 invocation function for block in facebook::react::RCTNativeModule::invoke(unsigned int, folly::dynamic&&, int) + 28 (RCTNativeModule.mm:104)
20  libdispatch.dylib             	       0x1801774ec _dispatch_call_block_and_release + 24
21  libdispatch.dylib             	       0x180178de0 _dispatch_client_callout + 16
22  libdispatch.dylib             	       0x180180f60 _dispatch_lane_serial_drain + 956
23  libdispatch.dylib             	       0x180181a98 _dispatch_lane_invoke + 388
24  libdispatch.dylib             	       0x18018cf44 _dispatch_root_queue_drain_deferred_wlh + 276
25  libdispatch.dylib             	       0x18018c5a0 _dispatch_workloop_worker_thread + 440
26  libsystem_pthread.dylib       	       0x1050ff814 _pthread_wqthread + 284
27  libsystem_pthread.dylib       	       0x1050fe5d4 start_wqthread + 8

Thread 27:
0   libsystem_pthread.dylib       	       0x1050fe5cc start_wqthread + 0

Thread 28:
0   libsystem_pthread.dylib       	       0x1050fe5cc start_wqthread + 0

Thread 29:
0   libsystem_pthread.dylib       	       0x1050fe5cc start_wqthread + 0

Thread 30:: com.apple.coremedia.sharedRootQueue.47
0   libsystem_kernel.dylib        	       0x104ad1104 semaphore_timedwait_trap + 8
1   libdispatch.dylib             	       0x180179310 _dispatch_sema4_timedwait + 60
2   libdispatch.dylib             	       0x1801798d4 _dispatch_semaphore_wait_slow + 72
3   libdispatch.dylib             	       0x18018b2e0 _dispatch_worker_thread + 468
4   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
5   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 31:: com.apple.coremedia.videomediaconverter
0   libsystem_kernel.dylib        	       0x104ad4670 __psynch_cvwait + 8
1   libsystem_pthread.dylib       	       0x1051039cc _pthread_cond_wait + 1216
2   CoreMedia                     	       0x18ad52030 WaitOnCondition + 16
3   CoreMedia                     	       0x18ad51c78 FigSemaphoreWaitRelative + 160
4   MediaToolbox                  	       0x18fdf8784 activitySchedulerOnThread + 92
5   CoreMedia                     	       0x18ad533c8 figThreadMain + 220
6   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
7   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 32:: com.apple.coremedia.videomentor
0   libsystem_kernel.dylib        	       0x104ad4670 __psynch_cvwait + 8
1   libsystem_pthread.dylib       	       0x1051039cc _pthread_cond_wait + 1216
2   CoreMedia                     	       0x18ad52030 WaitOnCondition + 16
3   CoreMedia                     	       0x18ad51c78 FigSemaphoreWaitRelative + 160
4   MediaToolbox                  	       0x18fd3356c videoMentorThreadWaitForOutputQueueToDropBelowHighWater + 244
5   MediaToolbox                  	       0x18fd2eec8 videoMentorThreadGenerateAndEnqueueFrame + 80
6   MediaToolbox                  	       0x18fd2ac9c videoMentorThreadForwardPlayback + 7372
7   MediaToolbox                  	       0x18fd25fe4 videoMentorThread + 1536
8   CoreMedia                     	       0x18ad533c8 figThreadMain + 220
9   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
10  libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 33:: com.apple.coremedia.JVTlib
0   libsystem_kernel.dylib        	       0x104ad10ec semaphore_wait_trap + 8
1   libdispatch.dylib             	       0x180179298 _dispatch_sema4_wait + 24
2   libdispatch.dylib             	       0x18017990c _dispatch_semaphore_wait_slow + 128
3   H264SW.videocodec             	       0x243c46604 0x243aec000 + 1418756
4   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
5   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 34:: com.apple.coremedia.JVTlib
0   libsystem_kernel.dylib        	       0x104ad10ec semaphore_wait_trap + 8
1   libdispatch.dylib             	       0x180179298 _dispatch_sema4_wait + 24
2   libdispatch.dylib             	       0x18017990c _dispatch_semaphore_wait_slow + 128
3   H264SW.videocodec             	       0x243c46604 0x243aec000 + 1418756
4   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
5   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 35:: com.apple.coremedia.JVTlib
0   libsystem_kernel.dylib        	       0x104ad10ec semaphore_wait_trap + 8
1   libdispatch.dylib             	       0x180179298 _dispatch_sema4_wait + 24
2   libdispatch.dylib             	       0x18017990c _dispatch_semaphore_wait_slow + 128
3   H264SW.videocodec             	       0x243c46604 0x243aec000 + 1418756
4   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
5   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 36:: com.apple.coremedia.rootQueue.fP-48.mP-47
0   libsystem_kernel.dylib        	       0x104ad1104 semaphore_timedwait_trap + 8
1   libdispatch.dylib             	       0x180179310 _dispatch_sema4_timedwait + 60
2   libdispatch.dylib             	       0x1801798d4 _dispatch_semaphore_wait_slow + 72
3   libdispatch.dylib             	       0x18018b2e0 _dispatch_worker_thread + 468
4   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
5   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8

Thread 37:: com.apple.coremedia.rootQueue.fP-48.mP-47
0   libsystem_kernel.dylib        	       0x104ad1104 semaphore_timedwait_trap + 8
1   libdispatch.dylib             	       0x180179310 _dispatch_sema4_timedwait + 60
2   libdispatch.dylib             	       0x1801798d4 _dispatch_semaphore_wait_slow + 72
3   libdispatch.dylib             	       0x18018b2e0 _dispatch_worker_thread + 468
4   libsystem_pthread.dylib       	       0x105103414 _pthread_start + 104
5   libsystem_pthread.dylib       	       0x1050fe5e0 thread_start + 8


Thread 26 crashed with ARM Thread State (64-bit):
    x0: 0x0000000000000000   x1: 0x0000000000000000   x2: 0x0000000000000000   x3: 0x0000000000000000
    x4: 0xfffffffffffb51a0   x5: 0x0000000000000020   x6: 0x0000600002661680   x7: 0x0000000000000000
    x8: 0x000000016b6cf000   x9: 0x62078a931233db9a  x10: 0x27206f7420293033  x11: 0x676e69727453534e
   x12: 0x534e27206f742029  x13: 0x2027676e69727453  x14: 0x3837636531783028  x15: 0x000a2e2930623937
   x16: 0x0000000000000148  x17: 0x0000000094c0381d  x18: 0x0000000000000000  x19: 0x0000000000000006
   x20: 0x000000016b6cf000  x21: 0x000000000002cf4f  x22: 0x000000016b6cf0e0  x23: 0x000000016b6cd4c0
   x24: 0x0000600002c3c3e8  x25: 0x0000000000000000  x26: 0x00000000000010ff  x27: 0x00006000019ec5c0
   x28: 0x00006000019eefc0   fp: 0x000000016b6cd3d0   lr: 0x0000000105103124
    sp: 0x000000016b6cd3b0   pc: 0x0000000104ad8f30 cpsr: 0x40001000
   far: 0x0000000000000000  esr: 0x56000080  Address size fault

Binary Images:
       0x104b54000 -        0x104bdffff dyld (*) <015e99c9-3c3f-3e28-ac31-9c9770316250> /usr/lib/dyld
       0x104a74000 -        0x104a77fff com.readionetwork.readio (1.0.0) <72b87f7b-8e85-39e2-b0b0-5279ca1f1cae> /Users/USER/Library/Developer/CoreSimulator/Devices/0C188186-714A-4AA9-808D-4DD1DF6A0332/data/Containers/Bundle/Application/B370FF5D-CC19-4CC2-B93A-A10EB4DE158C/Lotus.app/Lotus
       0x1051e0000 -        0x105223fff dyld_sim (*) <6499b476-4b66-3148-b85b-496aa7ea0690> /Volumes/VOLUME/*/dyld_sim
       0x10af04000 -        0x10cf17fff Lotus.debug.dylib (*) <2f94fed8-92db-3267-b1d9-dfb45dab6863> /Users/USER/Library/Developer/CoreSimulator/Devices/0C188186-714A-4AA9-808D-4DD1DF6A0332/data/Containers/Bundle/Application/B370FF5D-CC19-4CC2-B93A-A10EB4DE158C/Lotus.app/Lotus.debug.dylib
       0x105d00000 -        0x10606ffff dev.hermesengine.iphonesimulator (0.12.0) <15c2519b-0ac7-3032-b055-957892e423e1> /Users/USER/Library/Developer/CoreSimulator/Devices/0C188186-714A-4AA9-808D-4DD1DF6A0332/data/Containers/Bundle/Application/B370FF5D-CC19-4CC2-B93A-A10EB4DE158C/Lotus.app/Frameworks/hermes.framework/hermes
       0x105044000 -        0x10504bfff libsystem_platform.dylib (*) <3394e9ca-eb51-322d-a5eb-4d895d3b1c14> /usr/lib/system/libsystem_platform.dylib
       0x104ad0000 -        0x104b0bfff libsystem_kernel.dylib (*) <d4a8aec3-814e-3860-9e34-ee40a109e4c2> /usr/lib/system/libsystem_kernel.dylib
       0x1050fc000 -        0x10510bfff libsystem_pthread.dylib (*) <3df3256f-466e-37bc-b995-a5a9956e1415> /usr/lib/system/libsystem_pthread.dylib
       0x104ca4000 -        0x104caffff libobjc-trampolines.dylib (*) <5456a55f-46e1-386f-a22e-35e385923f2d> /Volumes/VOLUME/*/libobjc-trampolines.dylib
       0x18038b000 -        0x18075afff com.apple.CoreFoundation (6.9) <5f40c0e3-6b50-30c6-a686-3ab03c9a5404> /Volumes/VOLUME/*/CoreFoundation.framework/CoreFoundation
       0x190180000 -        0x190188fff com.apple.GraphicsServices (1.0) <587e9fae-3ada-346c-a206-e2949d400fff> /Volumes/VOLUME/*/GraphicsServices.framework/GraphicsServices
       0x184c81000 -        0x186976fff com.apple.UIKitCore (1.0) <d41f23e0-fb5e-33e4-9687-bb277a61190f> /Volumes/VOLUME/*/UIKitCore.framework/UIKitCore
               0x0 - 0xffffffffffffffff ??? (*) <00000000-0000-0000-0000-000000000000> ???
       0x1807da000 -        0x181420fff com.apple.Foundation (6.9) <1a4bc02e-f4dc-3ab5-9bb7-61d28064ffe8> /Volumes/VOLUME/*/Foundation.framework/Foundation
       0x1847b2000 -        0x184b30fff com.apple.CFNetwork (1.0) <722d2929-fe22-39d0-81cf-4cf7e2bb9caa> /Volumes/VOLUME/*/CFNetwork.framework/CFNetwork
       0x18acec000 -        0x18ae01fff com.apple.CoreMedia (1.0) <7bfc194d-4dde-3c28-ab38-0b1ba69b1b3b> /Volumes/VOLUME/*/CoreMedia.framework/CoreMedia
       0x18fb56000 -        0x19017ffff com.apple.MediaToolbox (1.0) <5ae3c95e-619c-3745-8b28-dfcc1da7d767> /Volumes/VOLUME/*/MediaToolbox.framework/MediaToolbox
       0x180175000 -        0x1801b9fff libdispatch.dylib (*) <71b0ee55-14d3-363f-88de-27caee135593> /Volumes/VOLUME/*/libdispatch.dylib
       0x243aec000 -        0x243cbaff7 H264SW.videocodec (*) <b63e34b9-92c4-33fd-9af9-eeea39b68661> /Volumes/VOLUME/*/H264SW.videocodec
       0x193a7a000 -        0x193dcefff com.apple.coremotion (2946.0.38.0.5) <32b776ee-95c5-30b2-9f46-363cc71582a8> /Volumes/VOLUME/*/CoreMotion.framework/CoreMotion
       0x1802e3000 -        0x180365ff3 libc++.1.dylib (*) <c996ec67-9783-3d31-85ad-67b6bda4349c> /Volumes/VOLUME/*/libc++.1.dylib
       0x1800f9000 -        0x180174ff3 libsystem_c.dylib (*) <7bdab434-28e5-3faf-a927-d854a96c40fa> /Volumes/VOLUME/*/libsystem_c.dylib
       0x194739000 -        0x194bdffff libswiftCore.dylib (*) <011c8243-6c15-332e-a506-8f279a3a5ac6> /Volumes/VOLUME/*/libswiftCore.dylib

EOF

-----------
Full Report
-----------

{"app_name":"Lotus","timestamp":"2025-05-19 16:03:36.00 -0400","app_version":"1.0.0","slice_uuid":"72b87f7b-8e85-39e2-b0b0-5279ca1f1cae","build_version":"1","platform":7,"bundleID":"com.readionetwork.readio","share_with_app_devs":1,"is_first_party":0,"bug_type":"309","os_version":"macOS 14.6 (23G80)","roots_installed":0,"name":"Lotus","incident_id":"5ECA4509-E9D4-4676-917B-D49A9C785F0A"}
{
  "uptime" : 440000,
  "procRole" : "Foreground",
  "version" : 2,
  "userID" : 501,
  "deployVersion" : 210,
  "modelCode" : "Mac15,12",
  "coalitionID" : 147005,
  "osVersion" : {
    "train" : "macOS 14.6",
    "build" : "23G80",
    "releaseType" : "User"
  },
  "captureTime" : "2025-05-19 16:03:32.0309 -0400",
  "codeSigningMonitor" : 1,
  "incident" : "5ECA4509-E9D4-4676-917B-D49A9C785F0A",
  "pid" : 6486,
  "translated" : false,
  "cpuType" : "ARM-64",
  "roots_installed" : 0,
  "bug_type" : "309",
  "procLaunch" : "2025-05-19 16:00:12.9312 -0400",
  "procStartAbsTime" : 10568879895825,
  "procExitAbsTime" : 10573656597155,
  "procName" : "Lotus",
  "procPath" : "\/Users\/USER\/Library\/Developer\/CoreSimulator\/Devices\/0C188186-714A-4AA9-808D-4DD1DF6A0332\/data\/Containers\/Bundle\/Application\/B370FF5D-CC19-4CC2-B93A-A10EB4DE158C\/Lotus.app\/Lotus",
  "bundleInfo" : {"CFBundleShortVersionString":"1.0.0","CFBundleVersion":"1","CFBundleIdentifier":"com.readionetwork.readio"},
  "storeInfo" : {"deviceIdentifierForVendor":"0B935753-685C-5C1C-A919-C925DE30D414","thirdParty":true},
  "parentProc" : "launchd_sim",
  "parentPid" : 97126,
  "coalitionName" : "com.apple.CoreSimulator.SimDevice.0C188186-714A-4AA9-808D-4DD1DF6A0332",
  "crashReporterKey" : "5EEA956B-8221-9568-DF77-517E5D20BA33",
  "responsiblePid" : 765,
  "responsibleProc" : "SimulatorTrampoline",
  "codeSigningID" : "com.readionetwork.readio",
  "codeSigningTeamID" : "",
  "codeSigningFlags" : 570425857,
  "codeSigningValidationCategory" : 10,
  "codeSigningTrustLevel" : 4294967295,
  "instructionByteStream" : {"beforePC":"4wAAVP17v6n9AwCR9+L\/l78DAJH9e8GowANf1sADX9YQKYDSARAA1A==","atPC":"4wAAVP17v6n9AwCR7eL\/l78DAJH9e8GowANf1sADX9ZwCoDSARAA1A=="},
  "wakeTime" : 7233,
  "sleepWakeUUID" : "FC2059CC-A6E3-4B33-B780-1CD1CE978847",
  "sip" : "enabled",
  "exception" : {"codes":"0x0000000000000000, 0x0000000000000000","rawCodes":[0,0],"type":"EXC_CRASH","signal":"SIGABRT"},
  "termination" : {"flags":0,"code":6,"namespace":"SIGNAL","indicator":"Abort trap: 6","byProc":"Lotus","byPid":6486},
  "ktriageinfo" : "VM - (arg = 0x3) mach_vm_allocate_kernel failed within call to vm_map_enter\nVM - (arg = 0x3) mach_vm_allocate_kernel failed within call to vm_map_enter\nVM - (arg = 0x3) mach_vm_allocate_kernel failed within call to vm_map_enter\n",
  "extMods" : {"caller":{"thread_create":0,"thread_set_state":0,"task_for_pid":0},"system":{"thread_create":0,"thread_set_state":0,"task_for_pid":1},"targeted":{"thread_create":0,"thread_set_state":0,"task_for_pid":0},"warnings":0},
  "faultingThread" : 26,
  "threads" : [{"id":6928132,"threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":19804094201856},{"value":0},{"value":19804094201856},{"value":2},{"value":4294967295},{"value":18446744073709550527},{"value":4611},{"value":0},{"value":1},{"value":4611},{"value":3072},{"value":0},{"value":45079976738816},{"value":18446744073709551569},{"value":45079976749314},{"value":0},{"value":4294967295},{"value":2},{"value":19804094201856},{"value":0},{"value":19804094201856},{"value":6093836808},{"value":8589934592},{"value":21592279046},{"value":21592279046},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4373489248},"cpsr":{"value":4096},"fp":{"value":6093836656},"sp":{"value":6093836576},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418352},"far":{"value":0}},"queue":"com.apple.main-thread","frames":[{"imageOffset":4464,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":75360,"symbol":"mach_msg2_internal","symbolLocation":76,"imageIndex":6},{"imageOffset":37656,"symbol":"mach_msg_overwrite","symbolLocation":532,"imageIndex":6},{"imageOffset":5352,"symbol":"mach_msg","symbolLocation":20,"imageIndex":6},{"imageOffset":588640,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":9},{"imageOffset":565796,"symbol":"__CFRunLoopRun","symbolLocation":1160,"imageIndex":9},{"imageOffset":563552,"symbol":"CFRunLoopRunSpecific","symbolLocation":536,"imageIndex":9},{"imageOffset":15120,"symbol":"GSEventRunModal","symbolLocation":160,"imageIndex":10},{"imageOffset":14818112,"symbol":"-[UIApplication _run]","symbolLocation":796,"imageIndex":11},{"imageOffset":14835000,"symbol":"UIApplicationMain","symbolLocation":124,"imageIndex":11},{"imageOffset":20744,"sourceLine":7,"sourceFile":"main.m","symbol":"__debug_main_executable_dylib_entry_point","imageIndex":3,"symbolLocation":96},{"imageOffset":5136,"symbol":"start_sim","symbolLocation":20,"imageIndex":2},{"imageOffset":24916,"symbol":"start","symbolLocation":2476,"imageIndex":0}]},{"id":6928145,"name":"com.apple.uikit.eventfetch-thread","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":68182605824000},{"value":0},{"value":68182605824000},{"value":2},{"value":4294967295},{"value":18446744073709550527},{"value":15875},{"value":0},{"value":1},{"value":15875},{"value":3072},{"value":0},{"value":0},{"value":18446744073709551569},{"value":2},{"value":0},{"value":4294967295},{"value":2},{"value":68182605824000},{"value":0},{"value":68182605824000},{"value":6096117112},{"value":8589934592},{"value":21592279046},{"value":21592279046},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4373489248},"cpsr":{"value":4096},"fp":{"value":6096116960},"sp":{"value":6096116880},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418352},"far":{"value":0}},"frames":[{"imageOffset":4464,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":75360,"symbol":"mach_msg2_internal","symbolLocation":76,"imageIndex":6},{"imageOffset":37656,"symbol":"mach_msg_overwrite","symbolLocation":532,"imageIndex":6},{"imageOffset":5352,"symbol":"mach_msg","symbolLocation":20,"imageIndex":6},{"imageOffset":588640,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":9},{"imageOffset":565796,"symbol":"__CFRunLoopRun","symbolLocation":1160,"imageIndex":9},{"imageOffset":563552,"symbol":"CFRunLoopRunSpecific","symbolLocation":536,"imageIndex":9},{"imageOffset":7671588,"symbol":"-[NSRunLoop(NSRunLoop) runMode:beforeDate:]","symbolLocation":208,"imageIndex":13},{"imageOffset":7672132,"symbol":"-[NSRunLoop(NSRunLoop) runUntilDate:]","symbolLocation":60,"imageIndex":13},{"imageOffset":15522952,"symbol":"-[UIEventFetcher threadMain]","symbolLocation":404,"imageIndex":11},{"imageOffset":7830892,"symbol":"__NSThread__start__","symbolLocation":720,"imageIndex":13},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6928387,"name":"com.facebook.SocketRocket.NetworkThread","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":103384157782016},{"value":0},{"value":103384157782016},{"value":2},{"value":4294967295},{"value":18446744073709550527},{"value":24071},{"value":0},{"value":1},{"value":24071},{"value":3072},{"value":0},{"value":151732604633088},{"value":18446744073709551569},{"value":151732604668418},{"value":0},{"value":4294967295},{"value":2},{"value":103384157782016},{"value":0},{"value":103384157782016},{"value":6098410824},{"value":8589934592},{"value":21592279046},{"value":21592279046},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4373489248},"cpsr":{"value":4096},"fp":{"value":6098410672},"sp":{"value":6098410592},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418352},"far":{"value":0}},"frames":[{"imageOffset":4464,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":75360,"symbol":"mach_msg2_internal","symbolLocation":76,"imageIndex":6},{"imageOffset":37656,"symbol":"mach_msg_overwrite","symbolLocation":532,"imageIndex":6},{"imageOffset":5352,"symbol":"mach_msg","symbolLocation":20,"imageIndex":6},{"imageOffset":588640,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":9},{"imageOffset":565796,"symbol":"__CFRunLoopRun","symbolLocation":1160,"imageIndex":9},{"imageOffset":563552,"symbol":"CFRunLoopRunSpecific","symbolLocation":536,"imageIndex":9},{"imageOffset":7671588,"symbol":"-[NSRunLoop(NSRunLoop) runMode:beforeDate:]","symbolLocation":208,"imageIndex":13},{"imageOffset":28443208,"sourceLine":71,"sourceFile":"SRRunLoopThread.m","symbol":"-[SRRunLoopThread main]","imageIndex":3,"symbolLocation":260},{"imageOffset":7830892,"symbol":"__NSThread__start__","symbolLocation":720,"imageIndex":13},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6928388,"name":"com.apple.NSURLConnectionLoader","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":108864536051712},{"value":0},{"value":108864536051712},{"value":2},{"value":4294967295},{"value":18446744073709550527},{"value":25347},{"value":0},{"value":1},{"value":25347},{"value":3072},{"value":0},{"value":137438953472000},{"value":18446744073709551569},{"value":137438953504002},{"value":0},{"value":4294967295},{"value":2},{"value":108864536051712},{"value":0},{"value":108864536051712},{"value":6098984248},{"value":8589934592},{"value":21592279046},{"value":21592279046},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4373489248},"cpsr":{"value":4096},"fp":{"value":6098984096},"sp":{"value":6098984016},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418352},"far":{"value":0}},"frames":[{"imageOffset":4464,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":75360,"symbol":"mach_msg2_internal","symbolLocation":76,"imageIndex":6},{"imageOffset":37656,"symbol":"mach_msg_overwrite","symbolLocation":532,"imageIndex":6},{"imageOffset":5352,"symbol":"mach_msg","symbolLocation":20,"imageIndex":6},{"imageOffset":588640,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":9},{"imageOffset":565796,"symbol":"__CFRunLoopRun","symbolLocation":1160,"imageIndex":9},{"imageOffset":563552,"symbol":"CFRunLoopRunSpecific","symbolLocation":536,"imageIndex":9},{"imageOffset":2127120,"symbol":"+[__CFN_CoreSchedulingSetRunnable _run:]","symbolLocation":372,"imageIndex":14},{"imageOffset":7830892,"symbol":"__NSThread__start__","symbolLocation":720,"imageIndex":13},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6928390,"name":"com.apple.CFSocket.private","threadState":{"x":[{"value":4},{"value":0},{"value":105553116287040},{"value":0},{"value":0},{"value":0},{"value":142682357760},{"value":0},{"value":6100660448},{"value":0},{"value":4736553104},{"value":31},{"value":31},{"value":4736553584},{"value":72057602293157273,"symbolLocation":72057594037927937,"symbol":"OBJC_CLASS_$___NSCFArray"},{"value":8255229336,"symbolLocation":0,"symbol":"OBJC_CLASS_$___NSCFArray"},{"value":93},{"value":6446663680,"symbolLocation":0,"symbol":"-[__NSCFArray objectAtIndex:]"},{"value":0},{"value":64},{"value":8255251480,"symbolLocation":0,"symbol":"__CFActiveSocketsLock"},{"value":2},{"value":4799597456},{"value":37},{"value":105553116287040},{"value":105553116287152},{"value":0},{"value":8053586520,"symbolLocation":0,"symbol":"__kCFNull"},{"value":6100659804}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6446814628},"cpsr":{"value":1610616832},"fp":{"value":6100660160},"sp":{"value":6100626384},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373460620},"far":{"value":0}},"frames":[{"imageOffset":46732,"symbol":"__select","symbolLocation":8,"imageIndex":6},{"imageOffset":648612,"symbol":"__CFSocketManager","symbolLocation":676,"imageIndex":9},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6928391,"name":"com.apple.CFNetwork.CustomProtocols","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":120959163957248},{"value":0},{"value":120959163957248},{"value":2},{"value":4294967295},{"value":18446744073709550527},{"value":28163},{"value":0},{"value":1},{"value":28163},{"value":3072},{"value":0},{"value":34084860461056},{"value":18446744073709551569},{"value":34084860468994},{"value":0},{"value":4294967295},{"value":2},{"value":120959163957248},{"value":0},{"value":120959163957248},{"value":6101228856},{"value":8589934592},{"value":21592279046},{"value":21592279046},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4373489248},"cpsr":{"value":4096},"fp":{"value":6101228704},"sp":{"value":6101228624},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418352},"far":{"value":0}},"frames":[{"imageOffset":4464,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":75360,"symbol":"mach_msg2_internal","symbolLocation":76,"imageIndex":6},{"imageOffset":37656,"symbol":"mach_msg_overwrite","symbolLocation":532,"imageIndex":6},{"imageOffset":5352,"symbol":"mach_msg","symbolLocation":20,"imageIndex":6},{"imageOffset":588640,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":9},{"imageOffset":565796,"symbol":"__CFRunLoopRun","symbolLocation":1160,"imageIndex":9},{"imageOffset":563552,"symbol":"CFRunLoopRunSpecific","symbolLocation":536,"imageIndex":9},{"imageOffset":2127120,"symbol":"+[__CFN_CoreSchedulingSetRunnable _run:]","symbolLocation":372,"imageIndex":14},{"imageOffset":7830892,"symbol":"__NSThread__start__","symbolLocation":720,"imageIndex":13},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6928393,"name":"com.apple.CFStream.LegacyThread","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":149546466279424},{"value":0},{"value":149546466279424},{"value":2},{"value":4294967295},{"value":18446744073709550527},{"value":34819},{"value":0},{"value":1},{"value":34819},{"value":3072},{"value":0},{"value":118747255799808},{"value":18446744073709551569},{"value":118747255827458},{"value":0},{"value":4294967295},{"value":2},{"value":149546466279424},{"value":0},{"value":149546466279424},{"value":6102376440},{"value":8589934592},{"value":21592279046},{"value":21592279046},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4373489248},"cpsr":{"value":4096},"fp":{"value":6102376288},"sp":{"value":6102376208},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418352},"far":{"value":0}},"frames":[{"imageOffset":4464,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":75360,"symbol":"mach_msg2_internal","symbolLocation":76,"imageIndex":6},{"imageOffset":37656,"symbol":"mach_msg_overwrite","symbolLocation":532,"imageIndex":6},{"imageOffset":5352,"symbol":"mach_msg","symbolLocation":20,"imageIndex":6},{"imageOffset":588640,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":9},{"imageOffset":565796,"symbol":"__CFRunLoopRun","symbolLocation":1160,"imageIndex":9},{"imageOffset":563552,"symbol":"CFRunLoopRunSpecific","symbolLocation":536,"imageIndex":9},{"imageOffset":712488,"symbol":"_legacyStreamRunLoop_workThread","symbolLocation":260,"imageIndex":9},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6928635,"name":"com.apple.coremedia.imagequeue.coreanimation.common","threadState":{"x":[{"value":260},{"value":0},{"value":2444544},{"value":0},{"value":0},{"value":65704},{"value":0},{"value":16664666},{"value":6117240104},{"value":0},{"value":105553152633416},{"value":2199023256066},{"value":512},{"value":0},{"value":512},{"value":2199023256064},{"value":305},{"value":38},{"value":0},{"value":105553152633392},{"value":105553156753384},{"value":6117241056},{"value":16664666},{"value":0},{"value":2444544},{"value":2519553},{"value":2519808},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4379916748},"cpsr":{"value":1610616832},"fp":{"value":6117240224},"sp":{"value":6117240080},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373431920},"far":{"value":0}},"frames":[{"imageOffset":18032,"symbol":"__psynch_cvwait","symbolLocation":8,"imageIndex":6},{"imageOffset":31180,"symbol":"_pthread_cond_wait","symbolLocation":1216,"imageIndex":7},{"imageOffset":418996,"symbol":"WaitOnConditionTimed","symbolLocation":72,"imageIndex":15},{"imageOffset":416896,"symbol":"FigSemaphoreWaitRelative","symbolLocation":168,"imageIndex":15},{"imageOffset":2869944,"symbol":"piqca_SharedPollingThread","symbolLocation":216,"imageIndex":16},{"imageOffset":422856,"symbol":"figThreadMain","symbolLocation":220,"imageIndex":15},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6929100,"name":"com.apple.coremedia.videomediaconverter","threadState":{"x":[{"value":260},{"value":0},{"value":8192},{"value":0},{"value":0},{"value":65704},{"value":0},{"value":0},{"value":6106344808},{"value":0},{"value":105553152759208},{"value":2},{"value":0},{"value":0},{"value":0},{"value":0},{"value":305},{"value":2},{"value":0},{"value":105553152759184},{"value":105553156821224},{"value":6106345696},{"value":0},{"value":0},{"value":8192},{"value":8193},{"value":8448},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4379916748},"cpsr":{"value":1610616832},"fp":{"value":6106344928},"sp":{"value":6106344784},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373431920},"far":{"value":0}},"frames":[{"imageOffset":18032,"symbol":"__psynch_cvwait","symbolLocation":8,"imageIndex":6},{"imageOffset":31180,"symbol":"_pthread_cond_wait","symbolLocation":1216,"imageIndex":7},{"imageOffset":417840,"symbol":"WaitOnCondition","symbolLocation":16,"imageIndex":15},{"imageOffset":416888,"symbol":"FigSemaphoreWaitRelative","symbolLocation":160,"imageIndex":15},{"imageOffset":2762628,"symbol":"activitySchedulerOnThread","symbolLocation":92,"imageIndex":16},{"imageOffset":422856,"symbol":"figThreadMain","symbolLocation":220,"imageIndex":15},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6929102,"name":"com.apple.coremedia.videomentor","threadState":{"x":[{"value":260},{"value":0},{"value":3584},{"value":0},{"value":0},{"value":65704},{"value":0},{"value":0},{"value":6107489320},{"value":0},{"value":105553152918408},{"value":2},{"value":0},{"value":0},{"value":0},{"value":0},{"value":305},{"value":104},{"value":0},{"value":105553152918384},{"value":105553156733480},{"value":6107492576},{"value":0},{"value":0},{"value":3584},{"value":3585},{"value":3840},{"value":10067496666499870221},{"value":6107490480}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4379916748},"cpsr":{"value":1610616832},"fp":{"value":6107489440},"sp":{"value":6107489296},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373431920},"far":{"value":0}},"frames":[{"imageOffset":18032,"symbol":"__psynch_cvwait","symbolLocation":8,"imageIndex":6},{"imageOffset":31180,"symbol":"_pthread_cond_wait","symbolLocation":1216,"imageIndex":7},{"imageOffset":417840,"symbol":"WaitOnCondition","symbolLocation":16,"imageIndex":15},{"imageOffset":416888,"symbol":"FigSemaphoreWaitRelative","symbolLocation":160,"imageIndex":15},{"imageOffset":1955180,"symbol":"videoMentorThreadWaitForOutputQueueToDropBelowHighWater","symbolLocation":244,"imageIndex":16},{"imageOffset":1937096,"symbol":"videoMentorThreadGenerateAndEnqueueFrame","symbolLocation":80,"imageIndex":16},{"imageOffset":1920156,"symbol":"videoMentorThreadForwardPlayback","symbolLocation":7372,"imageIndex":16},{"imageOffset":1900516,"symbol":"videoMentorThread","symbolLocation":1536,"imageIndex":16},{"imageOffset":422856,"symbol":"figThreadMain","symbolLocation":220,"imageIndex":15},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6929103,"name":"com.apple.coremedia.JVTlib","threadState":{"x":[{"value":14},{"value":18446744073709551615},{"value":23040},{"value":0},{"value":12448},{"value":528388},{"value":6108062196},{"value":6108062184},{"value":139015},{"value":18446744073709551615},{"value":97856534895106},{"value":4294967293},{"value":1099511627776},{"value":23040},{"value":1},{"value":98956046499840},{"value":18446744073709551580},{"value":97856534895106},{"value":0},{"value":105553152751664},{"value":105553152751600},{"value":18446744073709551615},{"value":5078974624},{"value":5041808},{"value":1},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6443995800},"cpsr":{"value":1610616832},"fp":{"value":6108065600},"sp":{"value":6108065584},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418220},"far":{"value":0}},"frames":[{"imageOffset":4332,"symbol":"semaphore_wait_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":17048,"symbol":"_dispatch_sema4_wait","symbolLocation":24,"imageIndex":17},{"imageOffset":18700,"symbol":"_dispatch_semaphore_wait_slow","symbolLocation":128,"imageIndex":17},{"imageOffset":1418756,"imageIndex":18},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6929104,"name":"com.apple.coremedia.JVTlib","threadState":{"x":[{"value":14},{"value":18446744073709551615},{"value":18446744073709551584},{"value":105553150968224},{"value":105553150968320},{"value":528388},{"value":6108635636},{"value":6108635624},{"value":138787},{"value":18446744073709551615},{"value":98956046522880},{"value":98956046522882},{"value":10496},{"value":2045},{"value":0},{"value":2724200632},{"value":18446744073709551580},{"value":6},{"value":0},{"value":105553152747584},{"value":105553152747520},{"value":18446744073709551615},{"value":5079122240},{"value":5041808},{"value":1},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6443995800},"cpsr":{"value":1610616832},"fp":{"value":6108639040},"sp":{"value":6108639024},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418220},"far":{"value":0}},"frames":[{"imageOffset":4332,"symbol":"semaphore_wait_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":17048,"symbol":"_dispatch_sema4_wait","symbolLocation":24,"imageIndex":17},{"imageOffset":18700,"symbol":"_dispatch_semaphore_wait_slow","symbolLocation":128,"imageIndex":17},{"imageOffset":1418756,"imageIndex":18},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6929105,"name":"com.apple.coremedia.JVTlib","threadState":{"x":[{"value":14},{"value":18446744073709551615},{"value":22784},{"value":0},{"value":12448},{"value":528388},{"value":6109209076},{"value":6109209064},{"value":121607},{"value":18446744073709551615},{"value":96757023267074},{"value":4294967293},{"value":1099511627776},{"value":22784},{"value":1},{"value":97856534872064},{"value":18446744073709551580},{"value":96757023267074},{"value":0},{"value":105553152747664},{"value":105553152747600},{"value":18446744073709551615},{"value":5079269856},{"value":5041808},{"value":1},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6443995800},"cpsr":{"value":1610616832},"fp":{"value":6109212480},"sp":{"value":6109212464},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418220},"far":{"value":0}},"frames":[{"imageOffset":4332,"symbol":"semaphore_wait_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":17048,"symbol":"_dispatch_sema4_wait","symbolLocation":24,"imageIndex":17},{"imageOffset":18700,"symbol":"_dispatch_semaphore_wait_slow","symbolLocation":128,"imageIndex":17},{"imageOffset":1418756,"imageIndex":18},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6929271,"name":"com.apple.CoreMotion.MotionThread","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":339779157753856},{"value":0},{"value":339779157753856},{"value":2},{"value":4294967295},{"value":18446744073709550527},{"value":79111},{"value":0},{"value":1},{"value":79111},{"value":3072},{"value":0},{"value":1099511627776},{"value":18446744073709551569},{"value":1099511628034},{"value":0},{"value":4294967295},{"value":2},{"value":339779157753856},{"value":0},{"value":339779157753856},{"value":6102948120},{"value":8589934592},{"value":21592279046},{"value":21592279046},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4373489248},"cpsr":{"value":4096},"fp":{"value":6102947968},"sp":{"value":6102947888},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418352},"far":{"value":0}},"frames":[{"imageOffset":4464,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":75360,"symbol":"mach_msg2_internal","symbolLocation":76,"imageIndex":6},{"imageOffset":37656,"symbol":"mach_msg_overwrite","symbolLocation":532,"imageIndex":6},{"imageOffset":5352,"symbol":"mach_msg","symbolLocation":20,"imageIndex":6},{"imageOffset":588640,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":9},{"imageOffset":565796,"symbol":"__CFRunLoopRun","symbolLocation":1160,"imageIndex":9},{"imageOffset":563552,"symbol":"CFRunLoopRunSpecific","symbolLocation":536,"imageIndex":9},{"imageOffset":567376,"symbol":"CFRunLoopRun","symbolLocation":60,"imageIndex":9},{"imageOffset":1871608,"imageIndex":19},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6929641,"frames":[{"imageOffset":9676,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":7}],"threadState":{"x":[{"value":6111326208},{"value":252939},{"value":6110789632},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":4096},"fp":{"value":0},"sp":{"value":6111326208},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4379895244},"far":{"value":0}}},{"id":6929642,"frames":[{"imageOffset":9676,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":7}],"threadState":{"x":[{"value":6113226752},{"value":107575},{"value":6112690176},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":4096},"fp":{"value":0},"sp":{"value":6113226752},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4379895244},"far":{"value":0}}},{"id":6930842,"frames":[{"imageOffset":9676,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":7}],"threadState":{"x":[{"value":6106918912},{"value":130331},{"value":6106382336},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":4096},"fp":{"value":0},"sp":{"value":6106918912},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4379895244},"far":{"value":0}}},{"id":6931194,"frames":[{"imageOffset":9676,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":7}],"threadState":{"x":[{"value":6095499264},{"value":188595},{"value":6094962688},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":4096},"fp":{"value":0},"sp":{"value":6095499264},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4379895244},"far":{"value":0}}},{"id":6931645,"frames":[{"imageOffset":9676,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":7}],"threadState":{"x":[{"value":6122401792},{"value":189739},{"value":6121865216},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":4096},"fp":{"value":0},"sp":{"value":6122401792},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4379895244},"far":{"value":0}}},{"id":6931860,"name":"com.facebook.react.JavaScript","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":1055733026127872},{"value":0},{"value":1055733026127872},{"value":2},{"value":4294967295},{"value":18446744073709550527},{"value":245807},{"value":0},{"value":1},{"value":245807},{"value":3072},{"value":0},{"value":13194139533312},{"value":18446744073709551569},{"value":13194139536386},{"value":0},{"value":4294967295},{"value":2},{"value":1055733026127872},{"value":0},{"value":1055733026127872},{"value":6104620264},{"value":8589934592},{"value":21592279046},{"value":21592279046},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4373489248},"cpsr":{"value":4096},"fp":{"value":6104620112},"sp":{"value":6104620032},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418352},"far":{"value":0}},"frames":[{"imageOffset":4464,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":75360,"symbol":"mach_msg2_internal","symbolLocation":76,"imageIndex":6},{"imageOffset":37656,"symbol":"mach_msg_overwrite","symbolLocation":532,"imageIndex":6},{"imageOffset":5352,"symbol":"mach_msg","symbolLocation":20,"imageIndex":6},{"imageOffset":588640,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":9},{"imageOffset":565796,"symbol":"__CFRunLoopRun","symbolLocation":1160,"imageIndex":9},{"imageOffset":563552,"symbol":"CFRunLoopRunSpecific","symbolLocation":536,"imageIndex":9},{"imageOffset":6725840,"sourceLine":350,"sourceFile":"RCTCxxBridge.mm","symbol":"+[RCTCxxBridge runRunLoop]","imageIndex":3,"symbolLocation":736},{"imageOffset":7830892,"symbol":"__NSThread__start__","symbolLocation":720,"imageIndex":13},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6931861,"name":"hades","threadState":{"x":[{"value":260},{"value":0},{"value":1024},{"value":0},{"value":0},{"value":160},{"value":0},{"value":0},{"value":6096694952},{"value":0},{"value":105553171917672},{"value":2},{"value":0},{"value":0},{"value":0},{"value":0},{"value":305},{"value":14293651164418},{"value":0},{"value":105553171917648},{"value":105553171917712},{"value":6096695520},{"value":0},{"value":0},{"value":1024},{"value":1025},{"value":1280},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4379916748},"cpsr":{"value":1610616832},"fp":{"value":6096695072},"sp":{"value":6096694928},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373431920},"far":{"value":0}},"frames":[{"imageOffset":18032,"symbol":"__psynch_cvwait","symbolLocation":8,"imageIndex":6},{"imageOffset":31180,"symbol":"_pthread_cond_wait","symbolLocation":1216,"imageIndex":7},{"imageOffset":131740,"symbol":"std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&)","symbolLocation":24,"imageIndex":20},{"imageOffset":1716640,"symbol":"hermes::vm::HadesGC::Executor::worker()","symbolLocation":112,"imageIndex":4},{"imageOffset":1716484,"symbol":"void* std::__1::__thread_proxy[abi:v160006]<std::__1::tuple<std::__1::unique_ptr<std::__1::__thread_struct, std::__1::default_delete<std::__1::__thread_struct>>, hermes::vm::HadesGC::Executor::Executor()::'lambda'()>>(void*)","symbolLocation":44,"imageIndex":4},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6931862,"name":"com.facebook.react.JavaScript","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592},{"value":784119294328832},{"value":0},{"value":784119294328832},{"value":2},{"value":4294967295},{"value":18446744073709550527},{"value":182567},{"value":0},{"value":1},{"value":182567},{"value":3072},{"value":0},{"value":0},{"value":18446744073709551569},{"value":2},{"value":0},{"value":4294967295},{"value":2},{"value":784119294328832},{"value":0},{"value":784119294328832},{"value":6110305512},{"value":8589934592},{"value":21592279046},{"value":21592279046},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4373489248},"cpsr":{"value":4096},"fp":{"value":6110305360},"sp":{"value":6110305280},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418352},"far":{"value":0}},"frames":[{"imageOffset":4464,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":75360,"symbol":"mach_msg2_internal","symbolLocation":76,"imageIndex":6},{"imageOffset":37656,"symbol":"mach_msg_overwrite","symbolLocation":532,"imageIndex":6},{"imageOffset":5352,"symbol":"mach_msg","symbolLocation":20,"imageIndex":6},{"imageOffset":588640,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":156,"imageIndex":9},{"imageOffset":565796,"symbol":"__CFRunLoopRun","symbolLocation":1160,"imageIndex":9},{"imageOffset":563552,"symbol":"CFRunLoopRunSpecific","symbolLocation":536,"imageIndex":9},{"imageOffset":6725840,"sourceLine":350,"sourceFile":"RCTCxxBridge.mm","symbol":"+[RCTCxxBridge runRunLoop]","imageIndex":3,"symbolLocation":736},{"imageOffset":7830892,"symbol":"__NSThread__start__","symbolLocation":720,"imageIndex":13},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6931863,"name":"hades","threadState":{"x":[{"value":260},{"value":0},{"value":0},{"value":0},{"value":0},{"value":160},{"value":0},{"value":0},{"value":6101806760},{"value":0},{"value":105553172052440},{"value":2},{"value":0},{"value":0},{"value":0},{"value":0},{"value":305},{"value":0},{"value":0},{"value":105553172052416},{"value":105553172052480},{"value":6101807328},{"value":0},{"value":0},{"value":0},{"value":1},{"value":256},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4379916748},"cpsr":{"value":1610616832},"fp":{"value":6101806880},"sp":{"value":6101806736},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373431920},"far":{"value":0}},"frames":[{"imageOffset":18032,"symbol":"__psynch_cvwait","symbolLocation":8,"imageIndex":6},{"imageOffset":31180,"symbol":"_pthread_cond_wait","symbolLocation":1216,"imageIndex":7},{"imageOffset":131740,"symbol":"std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&)","symbolLocation":24,"imageIndex":20},{"imageOffset":1716640,"symbol":"hermes::vm::HadesGC::Executor::worker()","symbolLocation":112,"imageIndex":4},{"imageOffset":1716484,"symbol":"void* std::__1::__thread_proxy[abi:v160006]<std::__1::tuple<std::__1::unique_ptr<std::__1::__thread_struct, std::__1::default_delete<std::__1::__thread_struct>>, hermes::vm::HadesGC::Executor::Executor()::'lambda'()>>(void*)","symbolLocation":44,"imageIndex":4},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6931879,"frames":[{"imageOffset":9676,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":7}],"threadState":{"x":[{"value":6113800192},{"value":143123},{"value":6113263616},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":4096},"fp":{"value":0},"sp":{"value":6113800192},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4379895244},"far":{"value":0}}},{"id":6931880,"frames":[{"imageOffset":9676,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":7}],"threadState":{"x":[{"value":6114373632},{"value":77587},{"value":6113837056},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":4096},"fp":{"value":0},"sp":{"value":6114373632},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4379895244},"far":{"value":0}}},{"id":6932151,"name":"hades","threadState":{"x":[{"value":260},{"value":0},{"value":0},{"value":0},{"value":0},{"value":160},{"value":0},{"value":0},{"value":6094401192},{"value":0},{"value":105553172305256},{"value":2},{"value":0},{"value":0},{"value":0},{"value":0},{"value":305},{"value":0},{"value":0},{"value":105553172305232},{"value":105553172305296},{"value":6094401760},{"value":0},{"value":0},{"value":0},{"value":1},{"value":256},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4379916748},"cpsr":{"value":1610616832},"fp":{"value":6094401312},"sp":{"value":6094401168},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373431920},"far":{"value":0}},"frames":[{"imageOffset":18032,"symbol":"__psynch_cvwait","symbolLocation":8,"imageIndex":6},{"imageOffset":31180,"symbol":"_pthread_cond_wait","symbolLocation":1216,"imageIndex":7},{"imageOffset":131740,"symbol":"std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&)","symbolLocation":24,"imageIndex":20},{"imageOffset":1716640,"symbol":"hermes::vm::HadesGC::Executor::worker()","symbolLocation":112,"imageIndex":4},{"imageOffset":1716484,"symbol":"void* std::__1::__thread_proxy[abi:v160006]<std::__1::tuple<std::__1::unique_ptr<std::__1::__thread_struct, std::__1::default_delete<std::__1::__thread_struct>>, hermes::vm::HadesGC::Executor::Executor()::'lambda'()>>(void*)","symbolLocation":44,"imageIndex":4},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"triggered":true,"id":6932162,"threadState":{"x":[{"value":0},{"value":0},{"value":0},{"value":0},{"value":18446744073709244832},{"value":32},{"value":105553156511360},{"value":0},{"value":6097268736},{"value":7063766904824126362},{"value":2819375911280390195},{"value":7453010373643555662},{"value":6002778373593767977},{"value":2316934257218581587},{"value":4050815676115857448},{"value":2865504207386935},{"value":328},{"value":2495625245},{"value":0},{"value":6},{"value":6097268736},{"value":184143},{"value":6097268960},{"value":6097261760},{"value":105553162650600},{"value":0},{"value":4351},{"value":105553143449024},{"value":105553143459776}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4379914532},"cpsr":{"value":1073745920},"fp":{"value":6097261520},"sp":{"value":6097261488},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373450544,"matchesCrashFrame":1},"far":{"value":0}},"queue":"com.facebook.react.TrackPlayerModuleQueue","frames":[{"imageOffset":36656,"symbol":"__pthread_kill","symbolLocation":8,"imageIndex":6},{"imageOffset":28964,"symbol":"pthread_kill","symbolLocation":256,"imageIndex":7},{"imageOffset":472300,"symbol":"abort","symbolLocation":104,"imageIndex":21},{"imageOffset":3099052,"symbol":"swift::fatalErrorv(unsigned int, char const*, char*)","symbolLocation":132,"imageIndex":22},{"imageOffset":3099080,"symbol":"swift::fatalError(unsigned int, char const*, ...)","symbolLocation":28,"imageIndex":22},{"imageOffset":3059184,"symbol":"swift::swift_dynamicCastFailure(void const*, char const*, void const*, char const*, char const*)","symbolLocation":76,"imageIndex":22},{"imageOffset":3059304,"symbol":"swift::swift_dynamicCastFailure(swift::TargetMetadata<swift::InProcess> const*, swift::TargetMetadata<swift::InProcess> const*, char const*)","symbolLocation":120,"imageIndex":22},{"imageOffset":3077568,"symbol":"swift_dynamicCast","symbolLocation":280,"imageIndex":22},{"imageOffset":29691828,"sourceLine":32,"sourceFile":"MediaURL.swift","symbol":"MediaURL.init(object:)","imageIndex":3,"symbolLocation":644},{"imageOffset":29815288,"sourceLine":36,"sourceFile":"Track.swift","symbol":"Track.init(dictionary:)","imageIndex":3,"symbolLocation":664},{"imageOffset":29814608,"sourceFile":"Track.swift","symbol":"Track.__allocating_init(dictionary:)","symbolLocation":56,"imageIndex":3},{"imageOffset":29771344,"sourceLine":661,"sourceFile":"RNTrackPlayer.swift","symbol":"RNTrackPlayer.setQueue(trackDicts:resolve:reject:)","imageIndex":3,"symbolLocation":320},{"imageOffset":29772540,"sourceFile":"\/<compiler-generated>","symbol":"@objc RNTrackPlayer.setQueue(trackDicts:resolve:reject:)","symbolLocation":152,"imageIndex":3},{"imageOffset":1256640,"symbol":"__invoking___","symbolLocation":144,"imageIndex":9},{"imageOffset":1244212,"symbol":"-[NSInvocation invoke]","symbolLocation":276,"imageIndex":9},{"imageOffset":1244876,"symbol":"-[NSInvocation invokeWithTarget:]","symbolLocation":60,"imageIndex":9},{"imageOffset":7174336,"sourceLine":584,"sourceFile":"RCTModuleMethod.mm","symbol":"-[RCTModuleMethod invokeWithBridge:module:arguments:]","imageIndex":3,"symbolLocation":1892},{"imageOffset":7191508,"sourceLine":196,"sourceFile":"RCTNativeModule.mm","symbol":"facebook::react::invokeInner(RCTBridge*, RCTModuleData*, unsigned int, folly::dynamic const&, int, (anonymous namespace)::SchedulingContext)","imageIndex":3,"symbolLocation":1848},{"imageOffset":7189160,"sourceLine":113,"sourceFile":"RCTNativeModule.mm","symbol":"facebook::react::RCTNativeModule::invoke(unsigned int, folly::dynamic&&, int)::$_0::operator()() const","imageIndex":3,"symbolLocation":136},{"imageOffset":7189012,"sourceLine":104,"sourceFile":"RCTNativeModule.mm","symbol":"invocation function for block in facebook::react::RCTNativeModule::invoke(unsigned int, folly::dynamic&&, int)","imageIndex":3,"symbolLocation":28},{"imageOffset":9452,"symbol":"_dispatch_call_block_and_release","symbolLocation":24,"imageIndex":17},{"imageOffset":15840,"symbol":"_dispatch_client_callout","symbolLocation":16,"imageIndex":17},{"imageOffset":48992,"symbol":"_dispatch_lane_serial_drain","symbolLocation":956,"imageIndex":17},{"imageOffset":51864,"symbol":"_dispatch_lane_invoke","symbolLocation":388,"imageIndex":17},{"imageOffset":98116,"symbol":"_dispatch_root_queue_drain_deferred_wlh","symbolLocation":276,"imageIndex":17},{"imageOffset":95648,"symbol":"_dispatch_workloop_worker_thread","symbolLocation":440,"imageIndex":17},{"imageOffset":14356,"symbol":"_pthread_wqthread","symbolLocation":284,"imageIndex":7},{"imageOffset":9684,"symbol":"start_wqthread","symbolLocation":8,"imageIndex":7}]},{"id":6932163,"frames":[{"imageOffset":9676,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":7}],"threadState":{"x":[{"value":6097842176},{"value":35375},{"value":6097305600},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":4096},"fp":{"value":0},"sp":{"value":6097842176},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4379895244},"far":{"value":0}}},{"id":6932164,"frames":[{"imageOffset":9676,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":7}],"threadState":{"x":[{"value":6099562496},{"value":6175},{"value":6099025920},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":4096},"fp":{"value":0},"sp":{"value":6099562496},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4379895244},"far":{"value":0}}},{"id":6932168,"frames":[{"imageOffset":9676,"symbol":"start_wqthread","symbolLocation":0,"imageIndex":7}],"threadState":{"x":[{"value":6103527424},{"value":1567},{"value":6102990848},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":4096},"fp":{"value":0},"sp":{"value":6103527424},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4379895244},"far":{"value":0}}},{"id":6932227,"name":"com.apple.coremedia.sharedRootQueue.47","threadState":{"x":[{"value":14},{"value":4294966578740461572},{"value":999999833},{"value":68719460488},{"value":1},{"value":0},{"value":0},{"value":1027},{"value":999999833},{"value":12297829382473034411},{"value":13835058055282163714},{"value":80000000},{"value":105553163309368},{"value":562949953483392},{"value":72057602293160717,"symbolLocation":72057594037927941,"symbol":"OBJC_CLASS_$___NSCFType"},{"value":8255232776,"symbolLocation":0,"symbol":"OBJC_CLASS_$___NSCFType"},{"value":18446744073709551578},{"value":6447488256,"symbolLocation":0,"symbol":"-[__NSCFType _tryRetain]"},{"value":0},{"value":10573771303555},{"value":4827572448},{"value":1000000000},{"value":4827572384},{"value":0},{"value":18446744069448138752},{"value":18446744071427850239},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6443995920},"cpsr":{"value":2147487744},"fp":{"value":6119534384},"sp":{"value":6119534352},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418244},"far":{"value":0}},"frames":[{"imageOffset":4356,"symbol":"semaphore_timedwait_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":17168,"symbol":"_dispatch_sema4_timedwait","symbolLocation":60,"imageIndex":17},{"imageOffset":18644,"symbol":"_dispatch_semaphore_wait_slow","symbolLocation":72,"imageIndex":17},{"imageOffset":90848,"symbol":"_dispatch_worker_thread","symbolLocation":468,"imageIndex":17},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6932230,"name":"com.apple.coremedia.videomediaconverter","threadState":{"x":[{"value":260},{"value":0},{"value":5376},{"value":0},{"value":0},{"value":65704},{"value":0},{"value":0},{"value":6121254248},{"value":0},{"value":105553152914664},{"value":2},{"value":0},{"value":0},{"value":0},{"value":0},{"value":305},{"value":2},{"value":0},{"value":105553152914640},{"value":105553156749288},{"value":6121255136},{"value":0},{"value":0},{"value":5376},{"value":5377},{"value":5632},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4379916748},"cpsr":{"value":1610616832},"fp":{"value":6121254368},"sp":{"value":6121254224},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373431920},"far":{"value":0}},"frames":[{"imageOffset":18032,"symbol":"__psynch_cvwait","symbolLocation":8,"imageIndex":6},{"imageOffset":31180,"symbol":"_pthread_cond_wait","symbolLocation":1216,"imageIndex":7},{"imageOffset":417840,"symbol":"WaitOnCondition","symbolLocation":16,"imageIndex":15},{"imageOffset":416888,"symbol":"FigSemaphoreWaitRelative","symbolLocation":160,"imageIndex":15},{"imageOffset":2762628,"symbol":"activitySchedulerOnThread","symbolLocation":92,"imageIndex":16},{"imageOffset":422856,"symbol":"figThreadMain","symbolLocation":220,"imageIndex":15},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6932231,"name":"com.apple.coremedia.videomentor","threadState":{"x":[{"value":260},{"value":0},{"value":1792},{"value":0},{"value":0},{"value":65704},{"value":0},{"value":0},{"value":6121825320},{"value":0},{"value":105553152913304},{"value":2},{"value":0},{"value":0},{"value":0},{"value":0},{"value":305},{"value":456},{"value":0},{"value":105553152913280},{"value":105553156747080},{"value":6121828576},{"value":0},{"value":0},{"value":1792},{"value":1793},{"value":2048},{"value":10067496666499048589},{"value":6121826480}],"flavor":"ARM_THREAD_STATE64","lr":{"value":4379916748},"cpsr":{"value":1610616832},"fp":{"value":6121825440},"sp":{"value":6121825296},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373431920},"far":{"value":0}},"frames":[{"imageOffset":18032,"symbol":"__psynch_cvwait","symbolLocation":8,"imageIndex":6},{"imageOffset":31180,"symbol":"_pthread_cond_wait","symbolLocation":1216,"imageIndex":7},{"imageOffset":417840,"symbol":"WaitOnCondition","symbolLocation":16,"imageIndex":15},{"imageOffset":416888,"symbol":"FigSemaphoreWaitRelative","symbolLocation":160,"imageIndex":15},{"imageOffset":1955180,"symbol":"videoMentorThreadWaitForOutputQueueToDropBelowHighWater","symbolLocation":244,"imageIndex":16},{"imageOffset":1937096,"symbol":"videoMentorThreadGenerateAndEnqueueFrame","symbolLocation":80,"imageIndex":16},{"imageOffset":1920156,"symbol":"videoMentorThreadForwardPlayback","symbolLocation":7372,"imageIndex":16},{"imageOffset":1900516,"symbol":"videoMentorThread","symbolLocation":1536,"imageIndex":16},{"imageOffset":422856,"symbol":"figThreadMain","symbolLocation":220,"imageIndex":15},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6932232,"name":"com.apple.coremedia.JVTlib","threadState":{"x":[{"value":14},{"value":18446744073709551615},{"value":18176},{"value":0},{"value":12448},{"value":528388},{"value":6122971636},{"value":6122971624},{"value":240899},{"value":18446744073709551615},{"value":76965813962498},{"value":4294967293},{"value":1099511627776},{"value":18176},{"value":1},{"value":78065325572096},{"value":18446744073709551580},{"value":76965813962498},{"value":0},{"value":105553152887120},{"value":105553152887056},{"value":18446744073709551615},{"value":5756092576},{"value":5041808},{"value":1},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6443995800},"cpsr":{"value":1610616832},"fp":{"value":6122975040},"sp":{"value":6122975024},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418220},"far":{"value":0}},"frames":[{"imageOffset":4332,"symbol":"semaphore_wait_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":17048,"symbol":"_dispatch_sema4_wait","symbolLocation":24,"imageIndex":17},{"imageOffset":18700,"symbol":"_dispatch_semaphore_wait_slow","symbolLocation":128,"imageIndex":17},{"imageOffset":1418756,"imageIndex":18},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6932233,"name":"com.apple.coremedia.JVTlib","threadState":{"x":[{"value":14},{"value":18446744073709551615},{"value":18446744073709551600},{"value":105553152865264},{"value":105553152865344},{"value":528388},{"value":6123545076},{"value":6123545064},{"value":193027},{"value":18446744073709551615},{"value":78065325590272},{"value":78065325590274},{"value":4608},{"value":2045},{"value":0},{"value":3095457811},{"value":18446744073709551580},{"value":167},{"value":0},{"value":105553152891760},{"value":105553152891696},{"value":18446744073709551615},{"value":5756240192},{"value":5041808},{"value":1},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6443995800},"cpsr":{"value":1610616832},"fp":{"value":6123548480},"sp":{"value":6123548464},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418220},"far":{"value":0}},"frames":[{"imageOffset":4332,"symbol":"semaphore_wait_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":17048,"symbol":"_dispatch_sema4_wait","symbolLocation":24,"imageIndex":17},{"imageOffset":18700,"symbol":"_dispatch_semaphore_wait_slow","symbolLocation":128,"imageIndex":17},{"imageOffset":1418756,"imageIndex":18},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6932234,"name":"com.apple.coremedia.JVTlib","threadState":{"x":[{"value":14},{"value":18446744073709551615},{"value":18446744073709551568},{"value":105553152725072},{"value":105553152725184},{"value":528388},{"value":6124118516},{"value":6124118504},{"value":239875},{"value":18446744073709551615},{"value":78065325590272},{"value":78065325590274},{"value":4608},{"value":2045},{"value":0},{"value":3712102585},{"value":18446744073709551580},{"value":53},{"value":0},{"value":105553152891200},{"value":105553152891136},{"value":18446744073709551615},{"value":5756387808},{"value":5041808},{"value":1},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6443995800},"cpsr":{"value":1610616832},"fp":{"value":6124121920},"sp":{"value":6124121904},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418220},"far":{"value":0}},"frames":[{"imageOffset":4332,"symbol":"semaphore_wait_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":17048,"symbol":"_dispatch_sema4_wait","symbolLocation":24,"imageIndex":17},{"imageOffset":18700,"symbol":"_dispatch_semaphore_wait_slow","symbolLocation":128,"imageIndex":17},{"imageOffset":1418756,"imageIndex":18},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6932248,"name":"com.apple.coremedia.rootQueue.fP-48.mP-47","threadState":{"x":[{"value":14},{"value":4294964968127725572},{"value":999999458},{"value":68719460488},{"value":6444049344,"symbolLocation":0,"symbol":"_dispatch_root_queue_push"},{"value":0},{"value":0},{"value":0},{"value":999999458},{"value":12297829382473034411},{"value":13835058055282163714},{"value":80000000},{"value":105553163447352},{"value":274877906945},{"value":9005068950962176},{"value":9005068950962176},{"value":18446744073709551578},{"value":9005068950962177},{"value":0},{"value":10573771303230},{"value":4876524816},{"value":1000000000},{"value":4876524752},{"value":0},{"value":18446744069448138752},{"value":18446744071427850239},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6443995920},"cpsr":{"value":2147487744},"fp":{"value":6133083952},"sp":{"value":6133083920},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418244},"far":{"value":0}},"frames":[{"imageOffset":4356,"symbol":"semaphore_timedwait_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":17168,"symbol":"_dispatch_sema4_timedwait","symbolLocation":60,"imageIndex":17},{"imageOffset":18644,"symbol":"_dispatch_semaphore_wait_slow","symbolLocation":72,"imageIndex":17},{"imageOffset":90848,"symbol":"_dispatch_worker_thread","symbolLocation":468,"imageIndex":17},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]},{"id":6932249,"name":"com.apple.coremedia.rootQueue.fP-48.mP-47","threadState":{"x":[{"value":14},{"value":4294965148516352004},{"value":999999500},{"value":68719460488},{"value":1},{"value":0},{"value":0},{"value":1027},{"value":999999500},{"value":12297829382473034411},{"value":13835058055282163714},{"value":80000000},{"value":105553163416760},{"value":274877906945},{"value":9005137670438912},{"value":9005137670438912},{"value":18446744073709551578},{"value":9005154850308097},{"value":0},{"value":10573771303230},{"value":4876524816},{"value":1000000000},{"value":4876524752},{"value":0},{"value":18446744069448138752},{"value":18446744071427850239},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6443995920},"cpsr":{"value":2147487744},"fp":{"value":6166310704},"sp":{"value":6166310672},"esr":{"value":1442840704,"description":" Address size fault"},"pc":{"value":4373418244},"far":{"value":0}},"frames":[{"imageOffset":4356,"symbol":"semaphore_timedwait_trap","symbolLocation":8,"imageIndex":6},{"imageOffset":17168,"symbol":"_dispatch_sema4_timedwait","symbolLocation":60,"imageIndex":17},{"imageOffset":18644,"symbol":"_dispatch_semaphore_wait_slow","symbolLocation":72,"imageIndex":17},{"imageOffset":90848,"symbol":"_dispatch_worker_thread","symbolLocation":468,"imageIndex":17},{"imageOffset":29716,"symbol":"_pthread_start","symbolLocation":104,"imageIndex":7},{"imageOffset":9696,"symbol":"thread_start","symbolLocation":8,"imageIndex":7}]}],
  "usedImages" : [
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 4373954560,
    "size" : 573440,
    "uuid" : "015e99c9-3c3f-3e28-ac31-9c9770316250",
    "path" : "\/usr\/lib\/dyld",
    "name" : "dyld"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4373037056,
    "CFBundleShortVersionString" : "1.0.0",
    "CFBundleIdentifier" : "com.readionetwork.readio",
    "size" : 16384,
    "uuid" : "72b87f7b-8e85-39e2-b0b0-5279ca1f1cae",
    "path" : "\/Users\/USER\/Library\/Developer\/CoreSimulator\/Devices\/0C188186-714A-4AA9-808D-4DD1DF6A0332\/data\/Containers\/Bundle\/Application\/B370FF5D-CC19-4CC2-B93A-A10EB4DE158C\/Lotus.app\/Lotus",
    "name" : "Lotus",
    "CFBundleVersion" : "1"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4380819456,
    "size" : 278528,
    "uuid" : "6499b476-4b66-3148-b85b-496aa7ea0690",
    "path" : "\/Volumes\/VOLUME\/*\/dyld_sim",
    "name" : "dyld_sim"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4478484480,
    "size" : 33636352,
    "uuid" : "2f94fed8-92db-3267-b1d9-dfb45dab6863",
    "path" : "\/Users\/USER\/Library\/Developer\/CoreSimulator\/Devices\/0C188186-714A-4AA9-808D-4DD1DF6A0332\/data\/Containers\/Bundle\/Application\/B370FF5D-CC19-4CC2-B93A-A10EB4DE158C\/Lotus.app\/Lotus.debug.dylib",
    "name" : "Lotus.debug.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4392484864,
    "CFBundleShortVersionString" : "0.12.0",
    "CFBundleIdentifier" : "dev.hermesengine.iphonesimulator",
    "size" : 3604480,
    "uuid" : "15c2519b-0ac7-3032-b055-957892e423e1",
    "path" : "\/Users\/USER\/Library\/Developer\/CoreSimulator\/Devices\/0C188186-714A-4AA9-808D-4DD1DF6A0332\/data\/Containers\/Bundle\/Application\/B370FF5D-CC19-4CC2-B93A-A10EB4DE158C\/Lotus.app\/Frameworks\/hermes.framework\/hermes",
    "name" : "hermes",
    "CFBundleVersion" : "0.12.0"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4379131904,
    "size" : 32768,
    "uuid" : "3394e9ca-eb51-322d-a5eb-4d895d3b1c14",
    "path" : "\/usr\/lib\/system\/libsystem_platform.dylib",
    "name" : "libsystem_platform.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4373413888,
    "size" : 245760,
    "uuid" : "d4a8aec3-814e-3860-9e34-ee40a109e4c2",
    "path" : "\/usr\/lib\/system\/libsystem_kernel.dylib",
    "name" : "libsystem_kernel.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4379885568,
    "size" : 65536,
    "uuid" : "3df3256f-466e-37bc-b995-a5a9956e1415",
    "path" : "\/usr\/lib\/system\/libsystem_pthread.dylib",
    "name" : "libsystem_pthread.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4375330816,
    "size" : 49152,
    "uuid" : "5456a55f-46e1-386f-a22e-35e385923f2d",
    "path" : "\/Volumes\/VOLUME\/*\/libobjc-trampolines.dylib",
    "name" : "libobjc-trampolines.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6446166016,
    "CFBundleShortVersionString" : "6.9",
    "CFBundleIdentifier" : "com.apple.CoreFoundation",
    "size" : 3997696,
    "uuid" : "5f40c0e3-6b50-30c6-a686-3ab03c9a5404",
    "path" : "\/Volumes\/VOLUME\/*\/CoreFoundation.framework\/CoreFoundation",
    "name" : "CoreFoundation",
    "CFBundleVersion" : "3038.1.101"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6712459264,
    "CFBundleShortVersionString" : "1.0",
    "CFBundleIdentifier" : "com.apple.GraphicsServices",
    "size" : 36864,
    "uuid" : "587e9fae-3ada-346c-a206-e2949d400fff",
    "path" : "\/Volumes\/VOLUME\/*\/GraphicsServices.framework\/GraphicsServices",
    "name" : "GraphicsServices",
    "CFBundleVersion" : "1.0"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6522671104,
    "CFBundleShortVersionString" : "1.0",
    "CFBundleIdentifier" : "com.apple.UIKitCore",
    "size" : 30367744,
    "uuid" : "d41f23e0-fb5e-33e4-9687-bb277a61190f",
    "path" : "\/Volumes\/VOLUME\/*\/UIKitCore.framework\/UIKitCore",
    "name" : "UIKitCore",
    "CFBundleVersion" : "8081.1.108"
  },
  {
    "size" : 0,
    "source" : "A",
    "base" : 0,
    "uuid" : "00000000-0000-0000-0000-000000000000"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6450683904,
    "CFBundleShortVersionString" : "6.9",
    "CFBundleIdentifier" : "com.apple.Foundation",
    "size" : 12873728,
    "uuid" : "1a4bc02e-f4dc-3ab5-9bb7-61d28064ffe8",
    "path" : "\/Volumes\/VOLUME\/*\/Foundation.framework\/Foundation",
    "name" : "Foundation",
    "CFBundleVersion" : "3038.1.101"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6517628928,
    "CFBundleShortVersionString" : "1.0",
    "CFBundleIdentifier" : "com.apple.CFNetwork",
    "size" : 3665920,
    "uuid" : "722d2929-fe22-39d0-81cf-4cf7e2bb9caa",
    "path" : "\/Volumes\/VOLUME\/*\/CFNetwork.framework\/CFNetwork",
    "name" : "CFNetwork",
    "CFBundleVersion" : "1568.100.1"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6623772672,
    "CFBundleShortVersionString" : "1.0",
    "CFBundleIdentifier" : "com.apple.CoreMedia",
    "size" : 1138688,
    "uuid" : "7bfc194d-4dde-3c28-ab38-0b1ba69b1b3b",
    "path" : "\/Volumes\/VOLUME\/*\/CoreMedia.framework\/CoreMedia",
    "name" : "CoreMedia",
    "CFBundleVersion" : "3145.74.1.6"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6705995776,
    "CFBundleShortVersionString" : "1.0",
    "CFBundleIdentifier" : "com.apple.MediaToolbox",
    "size" : 6463488,
    "uuid" : "5ae3c95e-619c-3745-8b28-dfcc1da7d767",
    "path" : "\/Volumes\/VOLUME\/*\/MediaToolbox.framework\/MediaToolbox",
    "name" : "MediaToolbox",
    "CFBundleVersion" : "3145.74.1.6"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6443978752,
    "size" : 282624,
    "uuid" : "71b0ee55-14d3-363f-88de-27caee135593",
    "path" : "\/Volumes\/VOLUME\/*\/libdispatch.dylib",
    "name" : "libdispatch.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 9725460480,
    "size" : 1896440,
    "uuid" : "b63e34b9-92c4-33fd-9af9-eeea39b68661",
    "path" : "\/Volumes\/VOLUME\/*\/H264SW.videocodec",
    "name" : "H264SW.videocodec"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6772203520,
    "CFBundleShortVersionString" : "2946.0.38.0.5",
    "CFBundleIdentifier" : "com.apple.coremotion",
    "size" : 3493888,
    "uuid" : "32b776ee-95c5-30b2-9f46-363cc71582a8",
    "path" : "\/Volumes\/VOLUME\/*\/CoreMotion.framework\/CoreMotion",
    "name" : "CoreMotion",
    "CFBundleVersion" : "2946.0.38.0.5"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6445477888,
    "size" : 536564,
    "uuid" : "c996ec67-9783-3d31-85ad-67b6bda4349c",
    "path" : "\/Volumes\/VOLUME\/*\/libc++.1.dylib",
    "name" : "libc++.1.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6443470848,
    "size" : 507892,
    "uuid" : "7bdab434-28e5-3faf-a927-d854a96c40fa",
    "path" : "\/Volumes\/VOLUME\/*\/libsystem_c.dylib",
    "name" : "libsystem_c.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 6785568768,
    "size" : 4878336,
    "uuid" : "011c8243-6c15-332e-a506-8f279a3a5ac6",
    "path" : "\/Volumes\/VOLUME\/*\/libswiftCore.dylib",
    "name" : "libswiftCore.dylib"
  }
],
  "sharedCache" : {
  "base" : 6442450944,
  "size" : 3788111872,
  "uuid" : "bd271484-2a95-39ee-9107-edbbb20cb4e0"
},
  "vmSummary" : "ReadOnly portion of Libraries: Total=1.6G resident=0K(0%) swapped_out_or_unallocated=1.6G(100%)\nWritable regions: Total=1.4G written=0K(0%) resident=0K(0%) swapped_out=0K(0%) unallocated=1.4G(100%)\n\n                                VIRTUAL   REGION \nREGION TYPE                        SIZE    COUNT (non-coalesced) \n===========                     =======  ======= \nActivity Tracing                   256K        1 \nCG raster data                   158.3M      109 \nColorSync                          208K        9 \nCoreAnimation                    103.0M      107 \nCoreMedia HTTP cache              4640K       92 \nFoundation                          16K        1 \nIOSurface                         27.9M       21 \nImage IO                         208.6M      232 \nKernel Alloc Once                   32K        1 \nMALLOC                             1.1G      897 \nMALLOC guard page                  192K       12 \nMALLOC_LARGE (reserved)          146.5M       53         reserved VM address space (unallocated)\nSQLite page cache                  768K        6 \nSTACK GUARD                       56.6M       38 \nStack                             28.6M       38 \nVM_ALLOCATE                       47.0M       37 \n__DATA                            31.3M      778 \n__DATA_CONST                      85.7M      798 \n__DATA_DIRTY                       107K       12 \n__FONT_DATA                        2352        1 \n__LINKEDIT                       731.0M       10 \n__OBJC_RW                         2686K        1 \n__TEXT                           894.0M      811 \n__TPRO_CONST                       292K        2 \ndyld private memory                2.6G       13 \nlibnetwork                        57.6M       48 \nmapped file                      225.6M       80 \nshared memory                       16K        1 \n===========                     =======  ======= \nTOTAL                              6.5G     4209 \nTOTAL, minus reserved VM space     6.3G     4209 \n",
  "legacyInfo" : {
  "threadTriggered" : {
    "queue" : "com.facebook.react.TrackPlayerModuleQueue"
  }
},
  "logWritingSignature" : "323fd7dac87fe85a8d642bd3fd816e48a2e1e5c6",
  "trialInfo" : {
  "rollouts" : [
    {
      "rolloutId" : "6246d6a916a70b047e454124",
      "factorPackIds" : {

      },
      "deploymentId" : 240000010
    },
    {
      "rolloutId" : "62745b8e85854550ad70b6e4",
      "factorPackIds" : {
        "SIRI_TTS_DEVICE_TRAINING" : "6539d7f333b9b7499c6f1b63"
      },
      "deploymentId" : 240000073
    }
  ],
  "experiments" : [

  ]
}
}

Model: Mac15,12, BootROM 10151.140.19, proc 8:4:4 processors, 8 GB, SMC 
Graphics: Apple M3, Apple M3, Built-In
Display: Color LCD, 2560 x 1664 Retina, Main, MirrorOff, Online
Memory Module: LPDDR5, Hynix
AirPort: spairport_wireless_card_type_wifi (0x14E4, 0x4388), wl0: Apr  4 2024 20:57:11 version 23.30.58.0.41.51.138 FWID 01-baea9d27
AirPort: 
Bluetooth: Version (null), 0 services, 0 devices, 0 incoming serial ports
Network Service: Wi-Fi, AirPort, en0
USB Device: USB31Bus
USB Device: USB31Bus
Thunderbolt Bus: MacBook Air, Apple Inc.
Thunderbolt Bus: MacBook Air, Apple Inc.