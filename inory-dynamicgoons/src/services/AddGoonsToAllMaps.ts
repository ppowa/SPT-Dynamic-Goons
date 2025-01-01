import * as fs from "fs";
import { inject, injectable } from "tsyringe";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ILocation } from "@spt/models/eft/common/ILocation";
import { IBossLocationSpawn } from "@spt/models/eft/common/ILocationBase";

@injectable()
export class AddBossToAllMaps {
  private zonesConfig: Record<string, string[]>;
  private bossData: IBossLocationSpawn;

  constructor(private logger: ILogger, private zonesConfigPath: string) {
    this.logger.info(`[Dynamic Goons] Zones Config Path: ${zonesConfigPath}`);
    this.zonesConfig = this.loadZonesConfig();
    this.bossData = this.defineBossData();
  }

  public addBossToAllMaps(locationList: Record<string, ILocation>): void {
    const bossName = this.bossData.BossName;

    for (const mapName in this.zonesConfig) {
      const location = locationList[mapName];
      if (!location) {
        this.logger.info(
          `[Dynamic Goons] Skipping map '${mapName}' as it is not present in the locationList.`
        );
        continue;
      }

      const zonesForMap = this.zonesConfig[mapName];
      const combinedZones = zonesForMap.join(",");

      const mapBosses = location.base?.BossLocationSpawn || [];

      mapBosses.push({
        ...this.bossData,
        BossZone: combinedZones, // Combine all zones into a single entry
      });

      this.logger.info(
        `[Dynamic Goons] Added boss '${bossName}' to map '${mapName}' with zones '${combinedZones}'.`
      );
    }
  }

  private loadZonesConfig(): Record<string, string[]> {
    try {
      const data = fs.readFileSync(this.zonesConfigPath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      this.logger.error(
        `[Dynamic Goons] Error loading zones config: ${error.message}`
      );
      return {};
    }
  }

  private defineBossData(): IBossLocationSpawn {
    return {
      BossChance: 30,
      BossDifficult: "normal",
      BossEscortAmount: "0",
      BossEscortDifficult: "normal",
      BossEscortType: "exUsec",
      BossName: "bossKnight",
      BossPlayer: false,
      BossZone: "",
      Delay: 0,
      DependKarma: false,
      DependKarmaPVE: false,
      ForceSpawn: false,
      IgnoreMaxBots: true,
      RandomTimeSpawn: true,
      SpawnMode: ["pve", "regular"],
      Supports: [
        {
          BossEscortAmount: "1",
          BossEscortDifficult: ["normal"],
          BossEscortType: "followerBigPipe",
        },
        {
          BossEscortAmount: "1",
          BossEscortDifficult: ["normal"],
          BossEscortType: "followerBirdEye",
        },
      ],
      Time: -1,
      TriggerId: "",
      TriggerName: "",
    };
  }
}