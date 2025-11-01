import React, { useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

const DiscountForm = ({ onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    language: 'English',
    promotionName: '',
    discount: '',
    description: '',
    from: null,
    till: null,
    discountOnAddon: false
  });

  const languages = [
    { label: 'English', value: 'English' },
    // Add other languages if needed
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h4 className="modal-title">Add Discount</h4>
      </div>

      <div className="modal-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-sm-6 col-12 form-group">
              <label className="label-yelo">Language</label>
              <Dropdown
                value={formData.language}
                options={languages}
                onChange={(e) => handleChange({ target: { name: 'language', value: e.value } })}
                placeholder="Choose"
                disabled
                className="full-width"
              />
            </div>

            <div className="col-sm-6 col-12 form-group">
              <label className="label-yelo">
                Promotion Name<span className="error-star">*</span>
              </label>
              <input
                type="text"
                name="promotionName"
                value={formData.promotionName}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

            <div className="col-sm-6 col-12 form-group">
              <label className="label-yelo">
                Discount<span className="error-star">*</span>
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
            </div>

            <div className="col-sm-6 col-12 form-group">
              <label className="label-yelo">
                Description max 150 characters<span className="error-star">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={150}
                required
                style={{ height: 'auto' }}
              />
            </div>

            <div className="col-sm-6 col-12 form-group">
              <label className="label-yelo">
                From<span className="error-star">*</span>
              </label>
              <Calendar
                value={formData.from}
                onChange={(e) => handleDateChange('from', e.value)}
                showTime
                required
                className="full-width"
              />
            </div>

            <div className="col-sm-6 col-12 form-group">
              <label className="label-yelo">
                Till<span className="error-star">*</span>
              </label>
              <Calendar
                value={formData.till}
                onChange={(e) => handleDateChange('till', e.value)}
                showTime
                required
                className="full-width"
              />
            </div>

            <div className="col-sm-6 col-12 form-group">
              <label className="label-yelo">Discount on Addon</label>
              <label className="switch custom-switch">
                <input
                  type="checkbox"
                  name="discountOnAddon"
                  checked={formData.discountOnAddon}
                  onChange={handleChange}
                />
                <span></span>
              </label>
            </div>
          </div>
        </form>
      </div>

      <div className="modal-footer">
        <div className="d-flex justify-content-end">
          <button className="btn btn-yl-secondary mr-2" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-yl-primary mr-2" onClick={handleSubmit}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountForm;