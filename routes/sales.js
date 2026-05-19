const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

// ✅ YENI: Unikal satıcıları gətir - MÜTLƏQ /:id-DƏN ƏVVƏL!
router.get("/sellers/list", async (req, res) => {
  try {
    const sellers = await Sale.distinct("seller");

    res.json({
      success: true,
      count: sellers.length,
      data: sellers.sort(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Satıcıları yükləyərkən xəta",
      error: error.message,
    });
  }
});

// ✅ YENI: Unikal alıcıları gətir - /:id-dən əvvəl!
router.get("/buyers/list", async (req, res) => {
  try {
    const buyers = await Sale.distinct("buyer");

    res.json({
      success: true,
      count: buyers.length,
      data: buyers.sort(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Alıcıları yükləyərkən xəta",
      error: error.message,
    });
  }
});

// Bütün satışları gətir (filter ilə)
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate, buyer, seller, currency } = req.query;

    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (buyer) query.buyer = { $regex: buyer, $options: "i" };
    if (seller) query.seller = { $regex: seller, $options: "i" };
    if (currency) query.currency = currency;

    const sales = await Sale.find(query).sort({ date: -1 });

    res.json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Satışları yükləyərkən xəta",
      error: error.message,
    });
  }
});

// Tək satış gətir
router.get("/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Satış tapılmadı",
      });
    }
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Xəta baş verdi",
      error: error.message,
    });
  }
});

// ✅ UPSERT: Tək və ya çoxlu satış əlavə et / yenilə
router.post("/", async (req, res) => {
  try {
    const data = Array.isArray(req.body) ? req.body : [req.body];

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data boş ola bilməz",
      });
    }

    const results = {
      created: [],
      updated: [],
      errors: [],
    };

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      try {
        // Validasiya
        if (!item.date) throw new Error("Tarix tələb olunur");
        if (!item.amount || isNaN(Number(item.amount)))
          throw new Error("Məbləğ düzgün deyil");
        if (!item.buyer?.trim()) throw new Error("Alıcı tələb olunur");
        if (!item.seller?.trim()) throw new Error("Satıcı tələb olunur");

        const saleData = {
          date: new Date(item.date),
          amount: Number(item.amount),
          currency: item.currency || "AZN",
          buyer: item.buyer.trim(),
          seller: item.seller.trim(),
          description: item.description?.trim() || "",
          updatedAt: new Date(),
        };

        // Əgər id (externalId) varsa - upsert et
        if (item.id || item._id || item.externalId) {
          const externalId = String(item.id || item._id || item.externalId);

          const existingSale = await Sale.findOneAndUpdate(
            { externalId: externalId },
            { ...saleData, externalId: externalId },
            {
              new: true,
              upsert: true, // Yoxdursa yarat, varsa yenilə
              runValidators: true,
            },
          );

          results.updated.push({
            index: i,
            externalId: externalId,
            _id: existingSale._id,
            action:
              existingSale.createdAt.getTime() ===
              existingSale.updatedAt.getTime()
                ? "created"
                : "updated",
          });
        } else {
          // İd yoxdursa - yeni yarat
          const newSale = await Sale.create(saleData);
          results.created.push({
            index: i,
            _id: newSale._id,
            action: "created",
          });
        }
      } catch (itemError) {
        results.errors.push({
          index: i,
          message: itemError.message,
          data: item,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${results.created.length} yaradıldı, ${results.updated.length} yeniləndi${results.errors.length > 0 ? `, ${results.errors.length} xəta` : ""}`,
      summary: {
        created: results.created.length,
        updated: results.updated.length,
        errors: results.errors.length,
      },
      details: results,
      data: await Sale.find().sort({ date: -1 }).limit(10), // Son 10 satışı qaytar
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Satış əlavə edilərkən xəta",
      error: error.message,
    });
  }
});

// Satışı yenilə (manual)
router.put("/:id", async (req, res) => {
  try {
    const { date, amount, currency, buyer, seller, description } = req.body;

    const updateData = {
      date: date ? new Date(date) : undefined,
      amount: amount !== undefined ? Number(amount) : undefined,
      currency,
      buyer: buyer?.trim(),
      seller: seller?.trim(),
      description: description?.trim(),
      updatedAt: new Date(),
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const sale = await Sale.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Satış tapılmadı",
      });
    }

    res.json({
      success: true,
      message: "Satış uğurla yeniləndi",
      data: sale,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Satış yenilənərkən xəta",
      error: error.message,
    });
  }
});

// Satışı sil
router.delete("/:id", async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Satış tapılmadı",
      });
    }

    res.json({
      success: true,
      message: "Satış uğurla silindi",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Satış silinərkən xəta",
      error: error.message,
    });
  }
});

module.exports = router;
