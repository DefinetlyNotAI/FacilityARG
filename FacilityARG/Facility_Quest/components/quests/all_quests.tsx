import {Questline} from "@/lib/types";
import {Prologue} from "./prologue";
import {Facility} from "./facility";
import {EasterEggs} from "./eastereggs";
import {HiddenSecrets1, HiddenSecrets2} from "./hiddensecrets";
import {Discord} from "./discord";
import {BonusContent} from "./bonus";

export const Data: Questline[] = [
    ...Prologue,
    ...Facility,
    ...EasterEggs,
    ...HiddenSecrets1,
    ...HiddenSecrets2,
    ...Discord,
    ...BonusContent,
];
