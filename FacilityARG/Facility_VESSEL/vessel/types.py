from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Optional, Dict, Any
from prompt_toolkit import PromptSession
import random

__all__ = ["VesselObjects", "init"]

if TYPE_CHECKING:
    # Only for type checking to avoid circular imports
    from vessel.commands.breaking import BreakingDown
    from vessel.commands import CustomCommands, CommandExec, CommandRegistry
    from vessel.commands.crack import GlassBreaksEffect
    from vessel.createPuzzleVesselLogs import CreatePuzzleVesselLogs
    from vessel.sessionHandler import CommandCompleter, TabHandler
    from vessel.utils import Utils
    from vessel.vfx import FatalErrorPopup, CorruptEffect, WallPaper0, ScreenGlitch, ScreenTextOverlay, StrikeTheEnd
    from vessel.welcome import WelcomeMessages


@dataclass
class VesselObjects:
    """
    Container for all core Vessel system objects.

    Attributes:
        Lore (int): Randomized lore value.
        createLog (CreatePuzzleVesselLogs): Puzzle-related log handler.
        fatalErrPopup (FatalErrorPopup): Fatal error UI popup handler.
        corruptEffect (CorruptEffect): Corruption effect manager.
        screenCorruptEffect (ScreenGlitch): Screen glitch visual effect.
        utils (Utils): Utility functions' container.
        tts (Utils.TTSWrapper): Text-to-speech manager.
        keywordManager (Utils.KeywordManager): Keyword manager.
        vesselCompletionUtil (Optional[Utils.VesselCompletion]): Command completion utility.
        screenCrackEffect (Optional[GlassBreaksEffect]): Screen cracking visual effect.
        customCommand (Optional[CustomCommands]): Custom command registry.
        commandCompleter (Optional[CommandCompleter]): Command auto-completion handler.
        tabHandler (TabHandler): Tab/terminal input handler.
        terminalSession (PromptSession): Prompt toolkit session for terminal interaction.
        commandExec (Optional[CommandExec]): Command execution handler.
        wallpaper0 (WallPaper0): Wallpaper manager.
        startupMsg (Optional[WelcomeMessages]): Startup message display handler.
        commandRegistry (CommandRegistry): Global command registry.
        breakingDown (Optional[BreakingDown]): Object handling breaking-down sequences.
    """
    Lore: int
    createLog: 'CreatePuzzleVesselLogs'
    fatalErrPopup: 'FatalErrorPopup'
    corruptEffect: 'CorruptEffect'
    screenCorruptEffect: 'ScreenGlitch'
    utils: 'Utils'
    tts: 'Utils.TTSWrapper'
    keywordManager: 'Utils.KeywordManager'
    vesselCompletionUtil: Optional['Utils.VesselCompletion']
    screenCrackEffect: Optional['GlassBreaksEffect']
    customCommand: Optional['CustomCommands']
    commandCompleter: Optional['CommandCompleter']
    tabHandler: 'TabHandler'
    terminalSession: PromptSession
    commandExec: Optional['CommandExec']
    wallpaper0: 'WallPaper0'
    startupMsg: Optional['WelcomeMessages']
    commandRegistry: 'CommandRegistry'
    breakingDown: Optional['BreakingDown']
    textOverlay: Optional['ScreenTextOverlay']
    strikeTheEnd: Optional['StrikeTheEnd']


def __init_simple_objects() -> Dict[str, Any]:
    """
    Initialize objects that do not depend on the full VesselObjects container.

    Returns:
        Dict[str, Any]: Dictionary containing initialized simple objects.
    """
    from vessel.utils import Utils
    from vessel.createPuzzleVesselLogs import CreatePuzzleVesselLogs
    from vessel.vfx import FatalErrorPopup, CorruptEffect, WallPaper0, ScreenGlitch, ScreenTextOverlay

    util = Utils()

    simple_objects: Dict[str, Any] = {
        "Lore": random.randint(1, 100),
        "utils": util,
        "tts": util.TTSWrapper(),
        "keywordManager": util.KeywordManager(),
        "createLog": CreatePuzzleVesselLogs(),
        "fatalErrPopup": FatalErrorPopup(),
        "corruptEffect": CorruptEffect(),
        "screenCorruptEffect": ScreenGlitch(),
        "tabHandler": None,  # initialized later
        "terminalSession": PromptSession(),
        "wallpaper0": WallPaper0(),
        "commandRegistry": None,  # initialized later
        "textOverlay": ScreenTextOverlay(),
    }

    return simple_objects


def init() -> VesselObjects:
    """
    Fully initialize all VesselObjects, carefully resolving circular dependencies.

    Returns:
        VesselObjects: A fully initialized VesselObjects instance.
    """
    from vessel.commands.breaking import BreakingDown
    from vessel.commands import CustomCommands, CommandExec, CommandRegistry
    from vessel.commands.crack import GlassBreaksEffect
    from vessel.sessionHandler import CommandCompleter, TabHandler
    from vessel.welcome import WelcomeMessages
    from vessel.vfx import StrikeTheEnd

    # Phase 1: initialize simple objects
    simple = __init_simple_objects()

    # Phase 2: initialize objects that do not require reference to VesselObjects
    tabHandler = TabHandler()
    tabHandler.attach_reset(buffer=simple["terminalSession"].app.current_buffer)
    commandRegistry = CommandRegistry()

    # Phase 3: create preliminary VesselObjects placeholder to resolve circular dependencies
    vt = VesselObjects(
        Lore=simple["Lore"],
        createLog=simple["createLog"],
        fatalErrPopup=simple["fatalErrPopup"],
        corruptEffect=simple["corruptEffect"],
        screenCorruptEffect=simple["screenCorruptEffect"],
        utils=simple["utils"],
        tts=simple["tts"],
        keywordManager=simple["keywordManager"],
        vesselCompletionUtil=None,
        screenCrackEffect=None,
        customCommand=None,
        commandCompleter=None,
        tabHandler=tabHandler,
        terminalSession=simple["terminalSession"],
        commandExec=None,
        wallpaper0=simple["wallpaper0"],
        startupMsg=None,
        commandRegistry=commandRegistry,
        breakingDown=None,
        textOverlay=simple["textOverlay"],
        strikeTheEnd=None
    )

    # Phase 4: initialize objects that require reference to VesselObjects
    vt.vesselCompletionUtil = simple["utils"].VesselCompletion(vt)
    vt.screenCrackEffect = GlassBreaksEffect(vt)
    vt.startupMsg = WelcomeMessages(vt)
    vt.breakingDown = BreakingDown(vt)
    vt.strikeTheEnd = StrikeTheEnd(vt)
    # IMPORTANT THESE BE SET LAST DUE TO TYPE ERROR IF NOT
    vt.customCommand = CustomCommands(vt)
    vt.commandExec = CommandExec(vt)
    vt.commandCompleter = CommandCompleter(vt)

    # Set objects in simple dict that depend on vt
    simple["tabHandler"] = tabHandler
    simple["commandRegistry"] = commandRegistry

    return vt
