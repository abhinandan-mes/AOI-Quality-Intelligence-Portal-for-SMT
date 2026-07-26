import re

with open("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/backend/src/services/fileWatcher.ts", "r") as f:
    content = f.read()

# Modify processSPIFile to extract spcData
old_spifile_end = """              defects.push({ 
                componentName: comp.$.name || 'Unknown', 
                defectType: defectType,
                blockId: blockId
              });
            }
          }
        }
      }
    }
  }

  await saveOrUpdateInspection(barcode, modelName, machineId, lineName, 'SPI', inspTime, status, filePath, {
    spiHeightAvg, spiAreaAvg, spiVolumeAvg, side
  }, defects);
};"""

new_spifile_end = """              defects.push({ 
                componentName: comp.$.name || 'Unknown', 
                defectType: defectType,
                blockId: blockId
              });
            }
          }
          
          // Extract Component Level SPC Data
          if (comp.Value) {
            spcData.push({
              componentName: comp.$.name || 'Unknown',
              height: parseFloat(comp.Value.Height?.$.data || "0"),
              area: parseFloat(comp.Value.Area?.$.data || "0"),
              volume: parseFloat(comp.Value.Volume?.$.data || "0"),
              offsetX: parseFloat(comp.Value.Offset?.$.data_x || "0"),
              offsetY: parseFloat(comp.Value.Offset?.$.data_y || "0"),
            });
          }
        }
      }
    }
  }

  await saveOrUpdateInspection(barcode, modelName, machineId, lineName, 'SPI', inspTime, status, filePath, {
    spiHeightAvg, spiAreaAvg, spiVolumeAvg, side
  }, defects, spcData);
};"""

content = content.replace("  const defects: { componentName: string; defectType: string; blockId?: string }[] = [];", "  const defects: { componentName: string; defectType: string; blockId?: string }[] = [];\n  const spcData: any[] = [];")
content = content.replace(old_spifile_end, new_spifile_end)

# Update saveOrUpdateInspection
old_save = """  extraData: any = {},
  defects: { componentName: string; defectType: string; blockId?: string }[] = []
) => {"""

new_save = """  extraData: any = {},
  defects: { componentName: string; defectType: string; blockId?: string }[] = [],
  spcData: any[] = []
) => {"""

content = content.replace(old_save, new_save)

old_defects_save = """  if (defects.length > 0) {
    await prisma.defect.createMany({
      data: defects.map(d => ({ 
        inspectionId: newInsp.id, 
        componentName: d.componentName, 
        defectType: d.defectType,
        blockId: d.blockId
      }))
    });
  }
};"""

new_defects_save = """  if (defects.length > 0) {
    await prisma.defect.createMany({
      data: defects.map(d => ({ 
        inspectionId: newInsp.id, 
        componentName: d.componentName, 
        defectType: d.defectType,
        blockId: d.blockId
      }))
    });
  }
  
  if (spcData.length > 0) {
    await prisma.spiSpcData.createMany({
      data: spcData.map(d => ({
        inspectionId: newInsp.id,
        componentName: d.componentName,
        height: d.height,
        area: d.area,
        volume: d.volume,
        offsetX: d.offsetX,
        offsetY: d.offsetY
      }))
    });
  }
};"""

content = content.replace(old_defects_save, new_defects_save)

with open("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/backend/src/services/fileWatcher.ts", "w") as f:
    f.write(content)
