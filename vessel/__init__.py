import random
from dataclasses import dataclass

from prompt_toolkit import PromptSession

from vessel.breaking import BreakingDown
from vessel.commands import CommandExec, CustomFuncRegistry
from vessel.crack import CrackEffectManager
from vessel.createPuzzleVesselLogs import CreatePuzzleVesselLogs
from vessel.exceptionHandler import handler, Colors, Format
from vessel.scripts import lost_recreate, dt_recreate, dm_recreate
from vessel.sessionHandler import CommandCompleter, TabHandler
from vessel.utils import Utils
from vessel.vesselLog import log
from vessel.vsa import chaos_audio, FatalErrorPopup, CorruptEffect, WallPaper0, ScreenGlitch
from vessel.welcome import WelcomeMessages


@dataclass
class VesselObjects:
    Lore: int
    createLog: CreatePuzzleVesselLogs
    fep: FatalErrorPopup
    corrupt: CorruptEffect
    screenCorrupt: ScreenGlitch
    utils: Utils
    tts: Utils.TTSWrapper
    keywordManager: Utils.KeywordManager
    cem: CrackEffectManager
    cfr: CustomFuncRegistry
    completer: CommandCompleter
    tab_handle: TabHandler
    session: PromptSession
    cmdExec: CommandExec
    vesselCompletion: Utils.VesselCompletion
    wp0: WallPaper0
    message: WelcomeMessages

def VT_init() -> VesselObjects:
    Lore = random.randint(1, 100)
    createLog: CreatePuzzleVesselLogs = CreatePuzzleVesselLogs()
    fep: FatalErrorPopup = FatalErrorPopup()
    corrupt: CorruptEffect = CorruptEffect()
    screenCorrupt: ScreenGlitch = ScreenGlitch()
    utils_: Utils = Utils()
    tts: Utils.TTSWrapper = utils_.TTSWrapper()
    keywordManager: Utils.KeywordManager = utils_.KeywordManager()
    cem: CrackEffectManager = CrackEffectManager(
        utils=utils_,
        tts=tts,
        createLog=createLog
    )
    cfr: CustomFuncRegistry = CustomFuncRegistry(
        corrupt=corrupt,
        tts=tts,
        createLog=createLog,
        keywordManager=keywordManager,
        utils=utils_,
        screenCorrupt=screenCorrupt,
        crackEffectManager=cem,
        fep=fep
    )
    completer: CommandCompleter = CommandCompleter(
        commands=list(cfr.list_commands().keys()),
        cfr=cfr
    )
    tab_handle: TabHandler = TabHandler()
    session: PromptSession = PromptSession()
    tab_handle.attach_reset(buffer=session.app.current_buffer)
    cmdExec: CommandExec = CommandExec(cfr=cfr)
    vesselCompletion: Utils.VesselCompletion = utils_.VesselCompletion(createLog=createLog)
    wp0: WallPaper0 = WallPaper0()
    message: WelcomeMessages = WelcomeMessages(
        createLog=createLog,
        cfr=cfr,
        utils=utils_,
        tts=tts,
        keywordManager=keywordManager,
        corrupt=corrupt,
        screenCorrupt=screenCorrupt,
        vesselCompletion=vesselCompletion,
        lore=Lore
    )

    return VesselObjects(
        Lore=Lore,
        createLog=createLog,
        fep=fep,
        corrupt=corrupt,
        screenCorrupt=screenCorrupt,
        utils=utils_,
        tts=tts,
        keywordManager=keywordManager,
        cem=cem,
        cfr=cfr,
        completer=completer,
        tab_handle=tab_handle,
        session=session,
        cmdExec=cmdExec,
        vesselCompletion=vesselCompletion,
        wp0=wp0,
        message=message
    )
