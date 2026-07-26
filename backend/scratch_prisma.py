with open("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/backend/prisma/schema.prisma", "r") as f:
    content = f.read()

# Add SpiSpcData model
new_model = """model SpiSpcData {
  id            String     @id @default(uuid())
  inspectionId  String
  componentName String
  height        Float?
  area          Float?
  volume        Float?
  offsetX       Float?
  offsetY       Float?
  createdAt     DateTime   @default(now())
  
  inspection    Inspection @relation(fields: [inspectionId], references: [id], onDelete: Cascade)

  @@index([inspectionId])
  @@index([componentName])
}

"""

if "model SpiSpcData" not in content:
    content += "\n" + new_model

# Add relation to Inspection
if "spiSpcData" not in content:
    content = content.replace(
        "defects        Defect[]",
        "defects        Defect[]\n  spiSpcData     SpiSpcData[]"
    )

with open("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/backend/prisma/schema.prisma", "w") as f:
    f.write(content)
